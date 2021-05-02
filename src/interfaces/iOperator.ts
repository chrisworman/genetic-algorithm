import IChromosome from "./iChromosome";
import IGAContext from "./iGAContext";
import IProblem from "./iProblem";

export default interface IOperator<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    operate(context: IGAContext<TProblem, TChromosome, TGene>): TChromosome[];
    getDescription(): string;
}
