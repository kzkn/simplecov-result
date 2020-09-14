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

class Result {
  constructor(commandName, timestamp, coverage) {
    this.commandName = commandName
    this.timestamp = timestamp
    this.files = FileList.parse(coverage)
  }

  static parse(rawResult) {
    const commandName = Object.keys(rawResult)[0];
    const { coverage, timestamp } = rawResult[commandName]
    return new Result(commandName, timestamp, coverage)
  }
}

class FileList {
  constructor(files) {
    this.files = files
  }

  coverageStatistics() {
    return {
      line: CoverageStatistics.merge(this.files.map(f => f.coverageStatistics().line))
    }
  }

  get length() {
    return this.files.length
  }

  static parse(coverage) {
    const files = Object.entries(coverage).map(([filename, coverageData]) => {
      return new SourceFile(filename, coverageData)
    })
    return new FileList(files)
  }
}

class SourceFile {
  constructor(filename, coverageData) {
    this.filename = filename
    this.coverageData = coverageData
  }

  lines() {
    if (!this._lines) {
      this._lines = this.coverageData['lines'].map((c, i) => new Line(i + 1, c))
    }
    return this._lines
  }

  coveredLines() {
    return this.lines().filter(l => l.isCovered)
  }

  missedLines() {
    return this.lines().filter(l => l.isMissed)
  }

  coverageStatistics() {
    return {
      line: new CoverageStatistics(this.coveredLines().length, this.missedLines().length)
    }
  }
}

class CoverageStatistics {
  constructor(covered, missed) {
    this.covered = covered
    this.missed = missed
  }

  get total() {
    return this.covered + this.missed
  }

  get ratio() {
    return this.total === 0 ? 1 : this.covered / this.total
  }

  get percent() {
    return this.ratio * 100
  }

  static merge(coverageStatistics) {
    const [covered, missed] = coverageStatistics.reduce(([c, m], stats) => {
      return [c + stats.covered, m + stats.missed]
    }, [0, 0])

    return new CoverageStatistics(covered, missed)
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
  FileList,
  SourceFile,
  Result,
}
