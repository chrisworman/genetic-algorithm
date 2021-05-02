import IChromosome from "./iChromosome";

export default interface IPopulation<TChromosome extends IChromosome<TGene>, TGene> {
    getEpoch: () => number;
    newEpoch: (newChromosomes: TChromosome[]) => void;
    getNFittest: (n: number) => TChromosome[];
    getSize: () => number;
    removeNLeastFit: (n: number) => void;
    removeUnfit: (minFitness: number) => void;
}
