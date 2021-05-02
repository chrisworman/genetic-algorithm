import IChromosome from "./iChromosome";
import IGAContext from "./iGAContext";
import IProblem from "./iProblem";

export default interface ISelector<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    select(context: IGAContext<TProblem, TChromosome, TGene>): TChromosome[];
}
