import IChromosome from "./iChromosome";
import IGAContext from "./iGAContext";
import IProblem from "./iProblem";

export default interface ISelection<
    TProblem extends IProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    select(context: IGAContext<TProblem, TChromosome, TGene>): TChromosome[];
}
