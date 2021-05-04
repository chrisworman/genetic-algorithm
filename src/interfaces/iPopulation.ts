import { IChromosome } from "./iChromosome";

export interface IPopulation<TChromosome extends IChromosome> {
    getEpoch: () => number;
    newEpoch: (newChromosomes: TChromosome[]) => void;
    getNFittest: (n: number) => TChromosome[];
    getSize: () => number;
    removeNLeastFit: (n: number) => void;
    removeUnfit: (minFitness: number) => void;
}
