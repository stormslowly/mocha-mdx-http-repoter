const Suite = require('../lib/suite')

describe('Suite', () => {

  let suTSuite = new Suite('', null)

  it('to Index', () => {


    suTSuite.addSuite(new Suite('slug_suite_1', suTSuite))
    suTSuite.addSuite(new Suite('slug_suite_1', suTSuite))
    suTSuite.addSuite(new Suite('slug_suite_1', suTSuite))

    suTSuite.index()

  })
})
