import IChromosome from "./iChromosome";
import IGAProblem from "./iGAProblem";
import IPopulation from "./iPopulation";

export default interface IGAContext<
    TProblem extends IGAProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    problem: TProblem;
    population: IPopulation<TChromosome, TGene>;
    best?: {
        chromosome: TChromosome;
        fitness: number;
    };
    getFitness: (gene: TChromosome) => number;
}
