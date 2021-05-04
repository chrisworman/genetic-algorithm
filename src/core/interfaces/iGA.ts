import { IGAContext } from ".";
import { IChromosome } from "./iChromosome";
import { IProblem } from "./iProblem";

export interface IGA<TProblem extends IProblem<TChromosome>, TChromosome extends IChromosome> {
    run(): IGAContext<TProblem, TChromosome>;
}
