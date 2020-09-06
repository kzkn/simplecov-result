const { SourceFile } = require('./index')

test('SourceFile#coveredLines', () => {
  const cov = { lines: [0, 1, null] }
  const file = new SourceFile('foo.rb', cov)
  const covered = file.coveredLines()
  expect(covered.length).toBe(1)
  expect(covered[0].lineNumber).toBe(2)
})

test('SourceFile#missedLines', () => {
  const cov = { lines: [0, 1, null] }
  const file = new SourceFile('foo.rb', cov)
  const covered = file.missedLines()
  expect(covered.length).toBe(1)
  expect(covered[0].lineNumber).toBe(1)
})
