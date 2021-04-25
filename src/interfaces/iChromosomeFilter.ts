import IChromosome from "./iChromosome";
import IGAContext from "./iGAContext";
import IGAProblem from "./iGAProblem";

export default interface IChromosomeFilter<
    TProblem extends IGAProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    filter(context: IGAContext<TProblem, TChromosome, TGene>): TChromosome[];
}
