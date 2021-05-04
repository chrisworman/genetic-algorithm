import { IChromosome } from "./iChromosome";

export interface IProblem<TChromosome extends IChromosome> {
    getFitness(gene: TChromosome): number;
}
