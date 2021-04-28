import IChromosome from "./iChromosome";

export default interface IProblem<TChromosome extends IChromosome<TGene>, TGene> {
    getFitness(gene: TChromosome): number;
}
