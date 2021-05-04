import { IChromosome } from "./iChromosome";
import { IOperator } from "./iOperator";
import { IPopulation } from "./iPopulation";
import { IProblem } from "./iProblem";

export interface IGAContext<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome,
> {
    problem: TProblem;
    population: IPopulation<TChromosome>;
    fittest?: TChromosome;
    selection: TChromosome[];
    currentOperator?: IOperator<TProblem, TChromosome>;
    getRandomSelection: () => TChromosome;
    getFitness: (gene: TChromosome) => number;
}
