import { IChromosome } from "./iChromosome";
import { IGAContext } from "./iGAContext";
import { IProblem } from "./iProblem";

export interface IOperator<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome,
> {
    operate(context: IGAContext<TProblem, TChromosome>): TChromosome[];
    getDescription(): string;
}
