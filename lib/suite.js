

module.exports = class Suite {
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
