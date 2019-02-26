const {expect} = require('chai')
const EventEmitter = require('events')
const MdxReporter = require('../mdx-reporter')
const mockTest = require("./helper").mockTest;

describe('Mdx-reporter', () => {
  let suiteIndex = 0
  let testIndex = 0

  const suiteObject = {
    fullTitle() {
      return `fullTitle ${suiteIndex++}`
    },
    title: `title ${suiteIndex++}`
  }
  let suite
  let runner = null

  const reportWriter = (toDir, suiteInTest) => {
    suite = suiteInTest
  }

  beforeEach(() => {
    suiteIndex = 0
    testIndex = 0
    suites = []
    runner = new EventEmitter()
    new MdxReporter(runner, null, reportWriter)
  })


  function startSuite() {
    runner.emit('suite', suiteObject)
  }

  function endSuite() {
    runner.emit('suite end')
  }

  function allEnd() {
    runner.emit('end')
  }


  function runTest() {
    const currentTest = mockTest(testIndex)
    runner.emit('test', currentTest)
    runner.emit('pass', currentTest)
    runner.emit('test end', currentTest)
  }

  it(`one suite run`, () => {
    startSuite()
    endSuite()

    allEnd()

    expect(suite.childSuites).to.have.length(0)
  })

  it(`2 suites run `, () => {
    startSuite()

    startSuite()
    endSuite()

    endSuite()
    allEnd()

    expect(suite.childSuites).to.have.length(1)
  })

  it(`run a test `, () => {
    startSuite()
    runTest()
    endSuite()

    allEnd()

    expect(suite.testReports).to.have.length(1)
  })
})
