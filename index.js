// Result
//   commandName: string
//   createdAt: Date
//   files: FileList
// FileList
//   files: [SourceFile]
// SourceFile
//   filename: string
//   coverageData: CoverageData
// CoverageData
//   lines: [number | null]
//   branches: { string => { string => number } }

class SourceFile {
  constructor(filename, coverageData) {
    this.filename = filename
    this.coverageData = coverageData
  }

  get lines() {
    if (!this._lines) {
      this._lines = this.coverageData['lines'].map((c, i) => new Line(i + 1, c))
    }
    return this._lines
  }

  coveredLines() {
    return this.lines.filter(l => l.isCovered)
  }

  missedLines() {
    return this.lines.filter(l => l.isMissed)
  }
}

class Line {
  constructor(lineNumber, coverage) {
    this.lineNumber = lineNumber
    this.coverage = coverage
  }

  get isCovered() {
    return this.coverage > 0
  }

  get isMissed() {
    return this.coverage === 0
  }

  get isNever() {
    return this.coverage === null
  }
}

module.exports = {
  SourceFile
}
