import IChromosome from "../interfaces/iChromosome";
import iGAContext from "../interfaces/iGAContext";
import IGAContextFactory from "../interfaces/iGAContextFactory";
import IOperator from "../interfaces/iOperator";
import IPopulation from "../interfaces/iPopulation";
import IProblem from "../interfaces/iProblem";

export default class CachedFitnessGAContext<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> implements iGAContext<TProblem, TChromosome, TGene> {
    public population: IPopulation<TChromosome>;
    public problem: TProblem;
    public selection: TChromosome[];
    public maxCacheSize: number = 100000;
    public currentOperator?: IOperator<TProblem, TChromosome, TGene>;
    private fitnessCache = new Map<string, number>();

    public constructor(problem: TProblem, initialPopulation: IPopulation<TChromosome>) {
        this.problem = problem;
        this.population = initialPopulation;
    }

    public getRandomSelection(): TChromosome {
        return this.selection[Math.floor(Math.random() * this.selection.length)];
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
        TProblem extends IProblem<TChromosome>,
        TChromosome extends IChromosome<TGene>,
        TGene,
    >(): IGAContextFactory<TProblem, TChromosome, TGene> {
        return {
            createContext: (
                problem: TProblem,
                initialPopulation: IPopulation<TChromosome>,
            ) => {
                return new CachedFitnessGAContext(problem, initialPopulation);
            },
        };
    }
}
