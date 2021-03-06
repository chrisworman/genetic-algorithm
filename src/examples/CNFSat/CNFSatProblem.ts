import { BooleanChromosome } from "../../core/booleanChromosome";
import { IProblem } from "../../core/interfaces/iProblem";
import { CNFExpression } from "./CNFExpression";

export class CNFSatProblem implements IProblem<BooleanChromosome> {
    public expression: CNFExpression;

    constructor(expression: CNFExpression) {
        this.expression = expression;
    }

    public getFitness(chromosome: BooleanChromosome): number {
        const truthAssignments: boolean[] = [];
        const geneCount = chromosome.getGeneCount();
        for (let i = 0; i < geneCount; i++) {
            truthAssignments.push(chromosome.getGeneAt(i));
        }
        return this.expression.numberOfClausesSatisfied(truthAssignments);
    }
}
