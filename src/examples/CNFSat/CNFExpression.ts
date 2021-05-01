import CNFClause from "./CNFClause";

// eg. (~x2 || x3 || x4) && (~x1) && (~x3 || ~x4)
export default class CNFExpresion {
    // https://people.sc.fsu.edu/~jburkardt/data/cnf/cnf.html
    public static fromCNFFileText(fileText: string): CNFExpresion {
        const fileLines = fileText.split("\n");
        const clauses = [];
        let variableCount = 0;
        let currentIndices: number[] = [];
        fileLines.forEach((line) => {
            const canonicalLine = line.trim().toLowerCase();
            if (canonicalLine) {
                if (canonicalLine.startsWith("p")) {
                    const [ /* p */ , /* file type */ , vc /* , expression count */ ] = canonicalLine.split(" ");
                    variableCount = parseInt(vc, 10);
                } else if (!canonicalLine.startsWith("c")) {
                    const components = canonicalLine.split(" ").map((c) => c.trim()).filter((c) => c.length > 0);
                    for (const component of components) {
                        if (component === "0") {
                            if (currentIndices.length > 0) {
                                clauses.push(CNFClause.fromCNFFileIndices(currentIndices));
                                currentIndices = [];
                            }
                        } else {
                            currentIndices.push(parseInt(component, 10));
                        }
                    }
                }
            }
        });
        if (currentIndices.length > 0) {
            clauses.push(CNFClause.fromCNFFileIndices(currentIndices));
        }
        return new CNFExpresion(variableCount, clauses);
    }

    private clauses: CNFClause[];
    private variableCount: number;

    public constructor(variableCount: number, clauses: CNFClause[]) {
        this.variableCount = variableCount;
        this.clauses = clauses;
    }

    public getVariableCount(): number {
        return this.variableCount;
    }

    public getClauseCount(): number {
        return this.clauses.length;
    }

    public numberOfClausesSatisfied(truthAssignments: boolean[]): number {
        let satisfied = 0;
        for (const clause of this.clauses) {
            if (clause.isSatisfied(truthAssignments)) {
                satisfied++;
            }
        }
        return satisfied;
    }

    public getUnsatisfiedClauses(truthAssignments: boolean[]): CNFClause[] {
        return this.clauses.filter((c) => !c.isSatisfied(truthAssignments));
    }
}
