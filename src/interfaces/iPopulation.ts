import IChromosome from "./iChromosome";

export default interface IPopulation<TChromosome extends IChromosome<TGene>, TGene> {
    number: number;
    chromosomes: TChromosome[];
}
