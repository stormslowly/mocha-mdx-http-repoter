const {mockTest} = require("./helper")

const Suite = require('../lib/suite')
const TestReport = require('../lib/testReport')
const {expect} = require('chai')

describe('Suite', () => {

  let suTSuite = new Suite('', null)
  suTSuite.addSuite(new Suite({slug: 'slug_suite_1', title: 'title1'}, suTSuite))

  const secondSuite = new Suite({slug: 'slug_suite_2', title: 'title2'}, suTSuite)
  suTSuite.addSuite(secondSuite)

  secondSuite.addTestReport(new TestReport(mockTest(1), []))
  secondSuite.addTestReport(new TestReport(mockTest(2), []))

  suTSuite.addTestReport(new TestReport(mockTest(3), []))

  it('to Index', () => {


    expect(suTSuite.index()).to.equal(
      `
# title1

# title2`
    );
  })

  it('to Mdx', () => {
    console.log(suTSuite.toMdx(0, true));
  })
})
