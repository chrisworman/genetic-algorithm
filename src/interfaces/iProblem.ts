import IChromosome from "./iChromosome";

export default interface IProblem<TChromosome extends IChromosome> {
    getFitness(gene: TChromosome): number;
}
