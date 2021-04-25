import ICNFClauseVariable from "./ICNFClauseVariable";

// eg. (~x2 || x3 || x4)
export default class CNFClause {
    // https://people.sc.fsu.edu/~jburkardt/data/cnf/cnf.html
    public static fromCNFFileLine(cnfFileLine: string) {
        const variables = cnfFileLine
            .split(" ")
            .map((indexOrDelimeter) => indexOrDelimeter.trim())
            .filter((indexOrDelimeter) => indexOrDelimeter.length > 0 && indexOrDelimeter !== "0")
            .map((oneBasedNegatedIndexString) => parseInt(oneBasedNegatedIndexString, 10))
            .map((oneBasedNegatedIndex) => {
                return {
                    index: Math.abs(oneBasedNegatedIndex) - 1, // convert to zero-based index
                    isNegated: oneBasedNegatedIndex < 0,
                };
            });
        return new CNFClause(variables);
    }

    private variables: ICNFClauseVariable[];

    private constructor(variables: ICNFClauseVariable[]) {
        // console.log(`Creating CNFClause ${variables.map((v) => `${v.isNegated ? "-" : ""}${v.index + 1}`)}`);
        this.variables = variables;
    }

    public isSatisfied(truthAssignments: boolean[]) {
        for (const { index, isNegated } of this.variables) {
            const isTrue = truthAssignments[index];
            if ((isTrue && !isNegated) || (!isTrue && isNegated)) {
                return true;
            }
        }
        return false;
    }
}
