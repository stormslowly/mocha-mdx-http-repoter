const Base = require('mocha/lib/reporters/base')
const utils = require('mocha/lib/utils');
const mkdirp = require('mkdirp').sync;
const nock = require('nock')
const path = require('path')
const fs = require('fs')
const cpy = require('cpx').copySync


exports = module.exports = Markdown;

const SUITE_PREFIX = '$';
const CODE_BEG = "```"
const CODE_END = "```"

function wrapCode(code, syntax = 'javascript') {
  return `
${CODE_BEG}${syntax}

${code}

${CODE_BEG}

`
}


function Markdown(runner) {
  Base.call(this, runner);

  let level = 0;
  let buf = '';
  let httpInTest = []


  function title(str) {
    return Array(level).join('#') + ' ' + str;
  }

  function mapTOC(suite, obj) {
    var ret = obj;
    var key = SUITE_PREFIX + suite.title;

    obj = obj[key] = obj[key] || {suite: suite};
    suite.suites.forEach(function (suite) {
      mapTOC(suite, obj);
    });

    return ret;
  }

  function stringifyTOC(obj, level) {
    ++level;
    var buf = '';
    var link;
    for (var key in obj) {
      if (key === 'suite') {
        continue;
      }
      if (key !== SUITE_PREFIX) {
        link = ' - [' + key.substring(1) + ']';
        link += '(#' + utils.slug(obj[key].suite.fullTitle()) + ')\n';
        buf += Array(level).join('  ') + link;
      }
      buf += stringifyTOC(obj[key], level);
    }
    return buf;
  }

  function generateTOC(suite) {
    var obj = mapTOC(suite, {});
    return stringifyTOC(obj, 0);
  }

  generateTOC(runner.suite);

  runner.on('suite', function (suite) {
    ++level;
    let slug = utils.slug(suite.fullTitle());
    buf += '<a name="' + slug + '"></a>' + '\n';
    buf += title(suite.title) + '\n';

  });

  runner.on('suite end', function () {
    --level;
  });

  runner.on('pass', function (test) {

    httpInTest = nock.recorder.play()
    let code = utils.clean(test.body);
    const mdx = `
### ${test.title}
<DemoBlock 
  code ={${JSON.stringify(code)}} 
  http={${JSON.stringify(httpInTest)}}
/>

`
    buf += mdx
  });

  runner.on('fail', (test, err) => {
    console.error('fail', test, err.message)
  })

  runner.on('test', (test) => {
    console.error("test start", test.title)
    httpInTest = []

  })

  runner.on('test end', (test) => {

    console.error("test end", test.title)
    nock.recorder.clear()
  })

  nock.recorder.rec({output_objects: true, dont_print: true, enable_reqheaders_recording: true})

  const mdxHeader = `
import DemoBlock from './DemoBlock'  

`
  runner.once('end', function () {

    const reportBase = path.join(process.cwd(), 'mdxreport')


    function writeReport() {

      fs.writeFileSync(path.join(reportBase, 'index.mdx'),
        [mdxHeader, '# TOC\n', generateTOC(runner.suite), buf].join('\n')
      )
    }

    mkdirp(reportBase)
    // process.stdout.write(mdxHeader);
    // process.stdout.write('# TOC\n');
    // process.stdout.write(generateTOC(runner.suite));
    // process.stdout.write(buf);

    writeReport()

    cpy(path.join(__dirname, 'component',"*.js"), reportBase);

    console.error('Done')
    console.error('check reporter with', `\nnpx x0 -p 9991 ${reportBase}`)
  });
}

