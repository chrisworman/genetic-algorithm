// eg. (~x2 || x3 || x4)
export default class CNFClause {
    // https://people.sc.fsu.edu/~jburkardt/data/cnf/cnf.html
    public static fromCNFFileLine(cnfFileLine: string) {
        const negatedIndices: number[] = cnfFileLine
            .split(" ")
            .map((v) => v.trim())
            .filter((v) => v.length > 0 && v !== "0")
            .map((v) => parseInt(v, 10));
        return new CNFClause(negatedIndices);
    }

    private indexNegated: Map<number, boolean>; // ~x3 <=> indexNegated.set(3, true)
    private asString: string;

    private constructor(negatedIndices: number[]) {
        this.asString = negatedIndices
            .map((ni) => (ni < 0) ? `~x${Math.abs(ni)}` : `x${ni}`)
            .join(" || ");
        this.indexNegated = new Map();
        negatedIndices.forEach((negatedIndex) => {
            this.indexNegated.set(Math.abs(negatedIndex), negatedIndex < 0);
        });
    }

    public statisfied(truthAssignments: boolean[]) {
        const entries = Array.from(this.indexNegated.entries());
        for (const [index, negated] of entries) {
            const isTrue = truthAssignments[index];
            if ((isTrue && !negated) || (!isTrue && negated)) {
                return true;
            }
        }
        return false;
    }
}
