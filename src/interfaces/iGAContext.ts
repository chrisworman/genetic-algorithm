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
    best?: {
        chromosome: TChromosome;
        fitness: number;
    };
    getFitness: (gene: TChromosome) => number;
}
