import IChromosome from "./iChromosome";
import IGAContext from "./iGAContext";
import IPopulation from "./iPopulation";
import IProblem from "./iProblem";

export default interface IGAContextFactory<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    createContext(
        problem: TProblem,
        initialPopulation: IPopulation<TChromosome>,
    ): IGAContext<TProblem, TChromosome, TGene>;
}
