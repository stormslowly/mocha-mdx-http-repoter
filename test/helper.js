exports.mockTest = function mockTest(index = 42) {

  return {
    title: `test ${index}`,
    body: `console.log(${index})`,
    slow() {
    }
  }
}
