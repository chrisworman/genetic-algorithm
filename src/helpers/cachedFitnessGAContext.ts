import IChromosome from "../interfaces/iChromosome";
import iGAContext from "../interfaces/iGAContext";
import IGAContextFactory from "../interfaces/iGAContextFactory";
import IPopulation from "../interfaces/iPopulation";
import IProblem from "../interfaces/iProblem";

export default class CachedFitnessGAContext<
    TProblem extends IProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> implements iGAContext<TProblem, TChromosome, TGene> {
    public population: IPopulation<TChromosome, TGene>;
    public problem: TProblem;
    public selection: TChromosome[];
    public maxCacheSize: number = 100000;
    private fitnessCache = new Map<string, number>();

    public constructor(problem: TProblem, initialPopulation: IPopulation<TChromosome, TGene>) {
        this.problem = problem;
        this.population = initialPopulation;
    }

    public getFitness(chromosome) {
        if (this.fitnessCache.size > this.maxCacheSize) {
            this.fitnessCache = new Map<string, number>();
        }
        const serializedGene = chromosome.serialize();
        let fitness = this.fitnessCache.get(serializedGene);
        if (fitness === undefined) {
            fitness = this.problem.getFitness(chromosome);
            this.fitnessCache.set(serializedGene, fitness);
        }
        return fitness;
    }

    public static getFactory<
        TProblem extends IProblem<TChromosome, TGene>,
        TChromosome extends IChromosome<TGene>,
        TGene,
    >(): IGAContextFactory<TProblem, TChromosome, TGene> {
        return {
            createContext: (
                problem: TProblem,
                initialPopulation: IPopulation<TChromosome, TGene>,
            ) => {
                return new CachedFitnessGAContext(problem, initialPopulation);
            },
        };
    }
}
