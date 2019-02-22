const {expect} = require('chai')
const EventEmitter = require('events')
const MdxReporter = require('../mdx-reporter')

describe('Mdx-reporter', () => {
  let suiteIndex = 0
  let testIndex = 0

  const suiteObject = {
    fullTitle() {
      return `fullTitle ${suiteIndex++}`
    }
  }
  let suites = []
  let runner = null

  const reportWriter = (toDir, suitesInTest) => {
    suites = suitesInTest
  }

  beforeEach(() => {
    suiteIndex = 0
    testIndex = 0
    suites = []
    runner = new EventEmitter()
    new MdxReporter(runner, reportWriter)
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
    const currentTest = {
      title: `test ${testIndex++}`,
      body: `console.log(${testIndex})`,
      slow() {
      }
    }
    runner.emit('test', currentTest)
    runner.emit('pass', currentTest)
    runner.emit('test end', currentTest)
  }

  it(`one suite run`, () => {
    startSuite()
    endSuite()

    allEnd()

    expect(suites).to.have.length(1)
  })

  it(`2 suites run `, () => {
    startSuite()
    endSuite()

    startSuite()
    endSuite()

    allEnd()
    expect(suites).to.have.length(2)
  })

  it(`nested suite run `, () => {
    startSuite()
    startSuite()
    endSuite()
    endSuite()

    allEnd()

    expect(suites).to.have.length(1)
    expect(suites[0].childSuites).to.have.length(1)
  })

  it(`run a test `, () => {
    startSuite()
    runTest()
    endSuite()

    allEnd()

    expect(suites).to.have.length(1)
  })
})
