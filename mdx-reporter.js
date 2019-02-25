const Base = require('mocha/lib/reporters/base')
const utils = require('mocha/lib/utils');
const mkdirp = require('mkdirp').sync;
const nock = require('nock')
const path = require('path')
const fs = require('fs')
const cpy = require('cpx').copySync
const TestReport = require('./lib/testReport')
const Suite = require('./lib/suite')

exports = module.exports = MdxReporter;

const SUITE_PREFIX = '$';


function MdxReporter(runner, _, reportWriter) {
  Base.call(this, runner);

  let level = 0;
  let buf = '';
  let httpInTest = []

  const topSuite = new Suite({}, null)

  let currentSuite = topSuite

  function title(str) {
    return Array(level).join('#') + ' ' + str;
  }

  function mapTOC(suite, obj) {
    const ret = obj;
    const key = SUITE_PREFIX + suite.title;

    obj = obj[key] = obj[key] || {suite: suite};
    suite.suites.forEach(function (suite) {
      mapTOC(suite, obj);
    });

    return ret;
  }

  function stringifyTOC(obj, level) {
    ++level;
    let buf = '';
    let link;
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
    const obj = mapTOC(suite, {});
    return stringifyTOC(obj, 0);
  }

  runner.on('suite', function (suite) {

    const slug = utils.slug(suite.fullTitle());
    const suiteTitle = suite.title

    const s = new Suite({slug, title: suiteTitle}, currentSuite)
    currentSuite.addSuite(s)
    currentSuite = s

    ++level;
    buf += '<a name="' + slug + '"></a>' + '\n\n';
    buf += title(suite.title) + '\n';
  });

  runner.on('suite end', function () {
    --level;
    currentSuite = currentSuite.parent
  });

  runner.on('pass', function (test) {

    httpInTest = nock.recorder.play()
    const tr = new TestReport(test, httpInTest)
    buf += tr.toMdx()
    currentSuite.addTestReport(tr)
  });

  runner.on('fail', (test, err) => {
    console.error('fail', test, err.message)
  })

  runner.on('test', () => {
    nock.recorder.clear()
    httpInTest = []
  })

  runner.on('test end', (test) => {
    nock.recorder.clear()
  })

  nock.recorder.rec({output_objects: true, dont_print: true, enable_reqheaders_recording: true})

  const mdxHeader = `
import DemoBlock from './DemoBlock'  

`
  runner.once('end', function () {

    nock.restore()

    const reportBase = path.join(process.cwd(), 'mdxreport')


    function defaultReporter(toDir) {

      const s = topSuite.childSuites[0]

      fs.writeFileSync(path.join(toDir, 'index.mdx'),
        [mdxHeader, '# TOC\n', s.toToc(), s.toMdx(0, true)].join('\n')
      )
      console.log(topSuite.childSuites)

      console.error('Done')
      console.error('check reporter with', `\nnpx x0 -p 9991 ${reportBase}`)
    }

    const writer = reportWriter || defaultReporter

    mkdirp(reportBase)
    cpy(path.join(__dirname, 'component', "*.js"), reportBase);

    writer(reportBase, topSuite)
  });
}

