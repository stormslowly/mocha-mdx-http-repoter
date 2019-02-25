const utils = require('mocha/lib/utils');

module.exports = class Suite {
  constructor(suite, parent) {
    this.data = suite
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

  index() {
    return this.childSuites.map((s) => `
# ${s.data.title}`).join('\n')
  }

  childrenSuiteToc(l) {

    return this.childSuites.map((s) => {
      return s.toToc(l)
    }).join('\n')
  }

  toMdx(l = 0, top = false) {

    const topContent = top ? `
${this.toToc(l)}
${this.childrenSuiteToc(l + 1)}` : ''


    return `
${topContent}
${this.testsMdx()}
${this.childrenTestReport()}`

  }

  childrenTestReport() {
    return this.childSuites.map((s) => s.toMdx()).join('\n')
  }

  toToc(level = 0) {
    const prefix = level === 0 ? '' : ' '.repeat(level + 1)

    return this.testReports.map(tr => {
      return `${prefix} - [${tr.test.title}](#${utils.slug(tr.test.title)})`
    }).join('\n\n')
  }

  testsMdx() {
    return this.testReports.map(tr => tr.toMdx()).join('\n')
  }
}
