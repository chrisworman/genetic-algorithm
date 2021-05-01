import IChromosome from "./iChromosome";
import IGAContext from "./iGAContext";
import IPopulation from "./iPopulation";
import IProblem from "./iProblem";

export default interface IGAContextFactory<
    TProblem extends IProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    createContext(
        problem: TProblem,
        initialPopulation: IPopulation<TChromosome, TGene>,
    ): IGAContext<TProblem, TChromosome, TGene>;
}
