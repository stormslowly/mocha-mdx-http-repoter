const mockTest = require("./helper").mockTest;
const TestReport = require('../lib/testReport')
const {expect} = require('chai')

describe('MdxReport', () => {

  it('toMdx', () => {

    const tr = new TestReport(mockTest(), [])

    expect(tr.toMdx()).to.equal(`

### test 42

<DemoBlock 
  code ={"console.log(42)"} 
  http={[]}
/>`)
  })
})
