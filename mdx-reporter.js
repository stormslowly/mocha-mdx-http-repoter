const Base = require('mocha/lib/reporters/base')
const utils = require('mocha/lib/utils');
const mkdirp = require('mkdirp').sync;
const nock = require('nock')
const path = require('path')
const fs = require('fs')
const cpy = require('cpx').copySync


exports = module.exports = MdxReporter;

const SUITE_PREFIX = '$';


class TestReport {
  constructor(test, httpInTest) {
    this.test = test
    this.http = httpInTest
  }
}


class Suite {
  constructor(slug, parent) {
    this.slug = slug
    this.parent = parent

    this.childSuites = []
    this.testReports = []
  }

  addSuite(suite) {
    this.childSuites.push(suite)
  }

  addTestReport(report) {
    this.testReports.push(report)
  }
}


function MdxReporter(runner, reportWriter) {
  Base.call(this, runner);

  let level = 0;
  let buf = '';
  let httpInTest = []


  let suites = []

  let currentSuite = null

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

    let slug = utils.slug(suite.fullTitle());
    if (level === 0) {
      const s = new Suite(slug)
      currentSuite = s
      suites.push(s)
    } else {
      const childSuite = new Suite(slug, currentSuite)
      currentSuite.addSuite(childSuite)
      currentSuite = childSuite
    }
    ++level;
    buf += '<a name="' + slug + '"></a>' + '\n';
    buf += title(suite.title) + '\n';
  });

  runner.on('suite end', function () {
    --level;
    currentSuite = currentSuite.parent
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
    currentSuite.addTestReport(new TestReport(test, httpInTest))
  });

  runner.on('fail', (test, err) => {
    console.error('fail', test, err.message)
  })

  runner.on('test', (test) => {
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


    function writeReport(toDir) {

      fs.writeFileSync(path.join(toDir, 'index.mdx'),
        [mdxHeader, '# TOC\n', generateTOC(runner.suite), buf].join('\n')
      )
      console.error('Done')
      console.error('check reporter with', `\nnpx x0 -p 9991 ${reportBase}`)
    }

    const writer = reportWriter || writeReport

    mkdirp(reportBase)
    cpy(path.join(__dirname, 'component', "*.js"), reportBase);

    writer(reportBase, suites)
  });
}

