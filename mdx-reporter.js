const Base = require('mocha/lib/reporters/base')
const utils = require('mocha/lib/utils');
const mkdirp = require('mkdirp').sync;
const nock = require('nock')
const path = require('path')
const fs = require('fs')
const cpy = require('cpx').copySync
const TestReport = require('./lib/testReport')
const Suite = require('./lib/suite')
const slugify = require('./lib/slugify')


exports = module.exports = MdxReporter;

const SUITE_PREFIX = '$';


function MdxReporter(runner, _, reportWriter) {
  Base.call(this, runner);

  let level = 0;
  let buf = '';
  let httpInTest = []

  let topSuite = null

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
        link += '(#' + slugify(obj[key].suite.fullTitle()) + ')\n';
        buf += Array(level).join('  ') + link;
      }
      buf += stringifyTOC(obj[key], level);
    }
    return buf;
  }

  runner.on('suite', function (suite) {

    const slug = slugify(suite.fullTitle());
    const suiteTitle = suite.title

    if (!topSuite) {
      topSuite = new Suite({}, null)
      currentSuite = topSuite
    } else {

      const s = new Suite({slug, title: suiteTitle}, currentSuite)
      currentSuite.addSuite(s)
      currentSuite = s

      ++level;
      buf += '<a name="' + slug + '"></a>' + '\n\n';
      buf += title(suite.title) + '\n';
    }
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

      fs.writeFileSync(path.join(toDir, 'index.mdx'),
        [mdxHeader, topSuite.index()].join('\n')
      )

      for (const child of topSuite.childSuites) {
        fs.writeFileSync(path.join(toDir, `${child.data.slug}.mdx`),
          [mdxHeader,
            '## [首页](/)\n',
            child.toMdx(0, true)].join('\n')
        )
      }

      console.error('Done')
      console.error('check reporter with',
        `\nnpx x0 -p 9991 ${reportBase}`
      )
    }

    const writer = reportWriter || defaultReporter

    mkdirp(reportBase)
    cpy(path.join(__dirname, 'component', "*.js"), reportBase);

    writer(reportBase, topSuite)
  });
}

