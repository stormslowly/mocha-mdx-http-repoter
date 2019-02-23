const utils = require('mocha/lib/utils');

module.exports = class TestReport {
  constructor(test, httpInTest) {
    this.test = test
    this.http = httpInTest
  }

  toMdx() {
    const code = utils.clean(this.test.body)
    return `
### ${this.test.title}
<DemoBlock 
  code ={${JSON.stringify(code)}} 
  http={${JSON.stringify(this.http)}}
/>`
  }
}

