import { IChromosome } from "./iChromosome";
import { IGAContext } from "./iGAContext";
import { IPopulation } from "./iPopulation";
import { IProblem } from "./iProblem";

export interface IGAContextFactory<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome,
> {
    createContext(
        problem: TProblem,
        initialPopulation: IPopulation<TChromosome>,
    ): IGAContext<TProblem, TChromosome>;
}
