import IGAProblem from "../../interfaces/iGAProblem";
import CNFExpression from "./CNFExpression";
import CNFGene from "./CNFGene";

export default class CNFSatProblem implements IGAProblem<CNFGene> {
    public expression: CNFExpression;
    constructor(expression: CNFExpression) {
        this.expression = expression;
    }

    public getFitness(gene: CNFGene): number {
       return this.expression.numberOfClausesSatisfied(gene.getTruthAssignments());
    }
}
