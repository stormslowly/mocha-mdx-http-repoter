const slug = require("slug");

slug.defaults.modes['pretty'].lower = true

const nSpaces = (n) => " ".repeat(n >= 0 ? n * 2 : 0)


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
 [${s.data.title}](/${s.data.slug})`).join('\n')
  }

  childrenSuiteToc(l) {


    return this.childSuites.map((s) => {
      return s.toToc(l)
    }).join('\n')
  }

  toToc(level = 0) {
    const prefix = nSpaces(level)

    const testList = this.testReports.map(tr => {
      return `${prefix} - [${tr.test.title}](#${slug(tr.test.title)})`
    }).join('\n\n')

    const suitTitle = `${nSpaces(level - 1)} ## ${this.data.title}`

    return suitTitle + '\n' + testList
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


  testsMdx() {
    return `
## ${this.data.title}    
    
${this.testReports.map(tr => tr.toMdx()).join('\n')}`
  }
}
