import IGAProblem from "./iGAProblem";
import IGene from "./iGene";
import IGeneration from "./iGeneration";

export default interface IGAContext<TProblem extends IGAProblem<TGene>, TGene extends IGene> {
    problem: TProblem;
    currentGeneration: IGeneration<TGene>;
    best?: {
        gene: TGene;
        fitness: number;
    };
    getFitness: (gene: TGene) => number;
}
