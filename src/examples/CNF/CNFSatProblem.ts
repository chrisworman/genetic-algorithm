import IGAProblem from "../../interfaces/iGAProblem";
import CNFChromosome from "./CNFChromosome";
import CNFExpression from "./CNFExpression";

export default class CNFSatProblem implements IGAProblem<CNFChromosome, boolean> {
    public expression: CNFExpression;
    constructor(expression: CNFExpression) {
        console.log(`Creating CNFSatProblem with ${expression.getClauseCount()} clauses`);
        this.expression = expression;
    }

    public getFitness(chromosome: CNFChromosome): number {
        const truthAssignments: boolean[] = [];
        const geneCount = chromosome.getGeneCount();
        for (let i = 0; i < geneCount; i++) {
            truthAssignments.push(chromosome.getGeneAt(i));
        }
        return this.expression.numberOfClausesSatisfied(truthAssignments);
    }
}
