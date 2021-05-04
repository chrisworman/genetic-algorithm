import { IChromosome } from "./iChromosome";
import { IGAContext } from "./iGAContext";
import { IProblem } from "./iProblem";

export interface ISelector<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome,
> {
    select(context: IGAContext<TProblem, TChromosome>): TChromosome[];
}
