import { SourceFile, FileList, Result } from '../src/index'

describe('SourceFile', () => {
  test('coveredLines', () => {
    const cov = { lines: [0, 1, null] }
    const file = new SourceFile('foo.rb', cov)
    const covered = file.coveredLines()
    expect(covered.length).toBe(1)
    expect(covered[0].lineNumber).toBe(2)
  })

  test('missedLines', () => {
    const cov = { lines: [0, 1, null] }
    const file = new SourceFile('foo.rb', cov)
    const covered = file.missedLines()
    expect(covered.length).toBe(1)
    expect(covered[0].lineNumber).toBe(1)
  })

  test('coverageStatistics', () => {
    const cov = { lines: [0, 1, null] }
    const file = new SourceFile('foo.rb', cov)
    const stats = file.coverageStatistics()
    expect(stats.line).not.toBeNull()
    expect(stats.line.covered).toBe(1)
    expect(stats.line.missed).toBe(1)
    expect(stats.line.total).toBe(2)
    expect(stats.line.ratio).toBe(0.5)
    expect(stats.line.percent).toBe(50)
  })
})

describe('FileList', () => {
  test('coverageStatistics', () => {
    const files = [
      new SourceFile('foo.rb', { lines: [0, 1, null] } ),
      new SourceFile('bar.rb', { lines: [1, 1] } ),
    ]
    const fileList = new FileList(files)
    const stats = fileList.coverageStatistics()
    expect(stats.line).not.toBeNull()
    expect(stats.line.covered).toBe(3)
    expect(stats.line.missed).toBe(1)
    expect(stats.line.ratio).toBe(0.75)
    expect(stats.line.percent).toBe(75)
  })
})

describe('Result', () => {
  test('parse', () => {
    const raw = {
      "RSpec": {
        "coverage": {
          "foo.rb": {
            "lines": [1, 1, null],
          },
          "bar.rb": {
            "lines": [1, 0, 0],
          },
        },
        "timestamp": 1598590411,
      }
    }

    const result = Result.parse(raw)
    expect(result.commandName).toBe('RSpec')
    expect(result.timestamp).toBe(1598590411)
    expect(result.files.length).toBe(2)
    expect(result.files.coverageStatistics().line.ratio).toBe(0.6)
  })
})
