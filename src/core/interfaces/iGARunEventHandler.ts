import { IChromosome } from "./iChromosome";
import { IGAContext } from "./iGAContext";
import { IProblem } from "./iProblem";

export type IGARunEventHandler<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome,
> = (context: IGAContext<TProblem, TChromosome>) => void;
