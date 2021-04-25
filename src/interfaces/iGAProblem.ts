import IChromosome from "./iChromosome";

export default interface IGAProblem<TChromosome extends IChromosome<TGene>, TGene> {
    getFitness(gene: TChromosome): number;
}
