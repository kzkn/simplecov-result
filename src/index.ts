type RawResultSet = {
  [commandName: string]: RawResult;
}

type RawResult = {
  coverage: { [filename: string]: CoverageData };
  timestamp: number;
}

type CoverageData = {
  lines: (number | null)[]
}

export class Result {
  commandName: string;
  timestamp: number;
  files: FileList;

  constructor(commandName: string, timestamp: number, coverage: RawResult['coverage']) {
    this.commandName = commandName
    this.timestamp = timestamp
    this.files = FileList.parse(coverage)
  }

  static parse(rawResult: RawResultSet): Result {
    const commandName = Object.keys(rawResult)[0];
    const { coverage, timestamp } = rawResult[commandName]
    return new Result(commandName, timestamp, coverage)
  }
}

type CoverageStaticticsByType = {
  line: CoverageStatistics
}

export class FileList {
  files: SourceFile[];

  constructor(files: SourceFile[]) {
    this.files = files
  }

  coverageStatistics(): CoverageStaticticsByType  {
    return {
      line: CoverageStatistics.merge(this.files.map(f => f.coverageStatistics().line))
    }
  }

  get length(): number {
    return this.files.length
  }

  static parse(coverage: RawResult['coverage']): FileList {
    const files = Object.entries(coverage).map(([filename, coverageData]) => {
      return new SourceFile(filename, coverageData)
    })
    return new FileList(files)
  }
}

export class SourceFile {
  filename: string;
  coverageData: CoverageData;
  _lines: Line[] | undefined

  constructor(filename: string, coverageData: CoverageData) {
    this.filename = filename
    this.coverageData = coverageData
  }

  lines(): Line[] {
    if (!this._lines) {
      this._lines = this.coverageData.lines.map((c, i) => new Line(i + 1, c))
    }
    return this._lines
  }

  coveredLines(): Line[] {
    return this.lines().filter(l => l.isCovered)
  }

  missedLines(): Line[] {
    return this.lines().filter(l => l.isMissed)
  }

  coverageStatistics(): CoverageStaticticsByType {
    return {
      line: new CoverageStatistics(this.coveredLines().length, this.missedLines().length)
    }
  }
}

class CoverageStatistics {
  covered: number;
  missed: number;

  constructor(covered: number, missed: number) {
    this.covered = covered
    this.missed = missed
  }

  get total(): number {
    return this.covered + this.missed
  }

  get ratio(): number {
    return this.total === 0 ? 1 : this.covered / this.total
  }

  get percent(): number {
    return this.ratio * 100
  }

  static merge(coverageStatistics: CoverageStatistics[]): CoverageStatistics {
    const [covered, missed] = coverageStatistics.reduce(([c, m], stats) => {
      return [c + stats.covered, m + stats.missed]
    }, [0, 0])

    return new CoverageStatistics(covered, missed)
  }
}

class Line {
  lineNumber: number;
  coverage: number | null;

  constructor(lineNumber: number, coverage: number | null) {
    this.lineNumber = lineNumber
    this.coverage = coverage
  }

  get isCovered(): boolean {
    return this.coverage !== null && this.coverage > 0
  }

  get isMissed(): boolean {
    return this.coverage !== null && this.coverage === 0
  }

  get isNever(): boolean {
    return this.coverage === null
  }
}
