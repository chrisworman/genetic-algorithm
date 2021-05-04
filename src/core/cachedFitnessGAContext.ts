import { IChromosome } from "../core/interfaces/iChromosome";
import { IGAContext } from "../core/interfaces/iGAContext";
import { IGAContextFactory } from "../core/interfaces/iGAContextFactory";
import { IOperator } from "../core/interfaces/iOperator";
import { IPopulation } from "../core/interfaces/iPopulation";
import { IProblem } from "../core/interfaces/iProblem";

export class CachedFitnessGAContext<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome,
> implements IGAContext<TProblem, TChromosome> {

    public static getFactory<
        TProblem extends IProblem<TChromosome>,
        TChromosome extends IChromosome<TGene>,
        TGene,
    >(): IGAContextFactory<TProblem, TChromosome> {
        return {
            createContext: (
                problem: TProblem,
                initialPopulation: IPopulation<TChromosome>,
            ) => {
                return new CachedFitnessGAContext(problem, initialPopulation);
            },
        };
    }
    public population: IPopulation<TChromosome>;
    public problem: TProblem;
    public selection: TChromosome[];
    public maxCacheSize: number = 100000;
    public currentOperator?: IOperator<TProblem, TChromosome>;
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
}
