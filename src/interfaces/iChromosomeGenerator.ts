import IChromosome from "./iChromosome";
import IGAContext from "./iGAContext";
import IGAProblem from "./iGAProblem";

export default interface IChromosomeGenerator<
    TProblem extends IGAProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    generate(context: IGAContext<TProblem, TChromosome, TGene>): TChromosome[];
}
