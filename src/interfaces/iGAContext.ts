import IChromosome from "./iChromosome";
import IPopulation from "./iPopulation";
import IProblem from "./iProblem";

export default interface IGAContext<
    TProblem extends IProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    problem: TProblem;
    population: IPopulation<TChromosome, TGene>;
    fittest?: TChromosome;
    selection: TChromosome[];
    getFitness: (gene: TChromosome) => number;
}
