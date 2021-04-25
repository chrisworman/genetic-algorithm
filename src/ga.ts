import IGAContext from "./interfaces/iGAContext";
import IGAProblem from "./interfaces/iGAProblem";
import IGene from "./interfaces/iGene";
import IGeneFilter from "./interfaces/iGeneFilter";
import IGeneGenerator from "./interfaces/iGeneGenerator";
import IGeneration from "./interfaces/iGeneration";

export default class GA<TProblem extends IGAProblem<TGene>, TGene extends IGene> {
    private problem: TProblem;
    private geneGenerators: Array<IGeneGenerator<TProblem, TGene>>;
    private geneFilters: Array<IGeneFilter<TProblem, TGene>>;
    private finishCondition: (context: IGAContext<TProblem, TGene>) => boolean;
    private currentContext: IGAContext<TProblem, TGene>;

    constructor(
        problem: TProblem,
        geneGenerators: Array<IGeneGenerator<TProblem, TGene>>,
        geneFilters: Array<IGeneFilter<TProblem, TGene>>,
        finishCondition: (context: IGAContext<TProblem, TGene>) => boolean,
    ) {
        this.problem = problem;
        this.geneGenerators = geneGenerators;
        this.geneFilters = geneFilters;
        this.finishCondition = finishCondition;
    }

    public run(): IGAContext<TProblem, TGene> {
        const fitnessCache = new Map<string, number>();
        this.currentContext = {
            currentGeneration: {
                genePool: [],
                number: 0,
            },
            getFitness: (gene) => {
                const serializedGene = gene.serialize();
                let fitness = fitnessCache.get(serializedGene);
                if (fitness === undefined) {
                    fitness = this.problem.getFitness(gene);
                    fitnessCache.set(serializedGene, fitness);
                }
                return fitness;
            },
            problem: this.problem,
        };
        do {
            this.geneGenerators.forEach((generator) => {
                const newGenes = generator.generate(this.currentContext);
                const newGenePool = this.currentContext.currentGeneration.genePool.concat(newGenes);
                this.currentContext.currentGeneration.genePool = newGenePool;
            });
            this.geneFilters.forEach((geneFilter) => {
                this.currentContext.currentGeneration.genePool = geneFilter.filter(this.currentContext);
            });
            this.currentContext.currentGeneration.genePool.forEach((gene) => {
                const fitness = this.currentContext.getFitness(gene);
                if (!this.currentContext.best || fitness > this.currentContext.best.fitness) {
                    this.currentContext.best = { gene, fitness };
                }
            });
            this.currentContext.currentGeneration.number++;
            console.log(`generation ${this.currentContext.currentGeneration.number}, gene pool size ${this.currentContext.currentGeneration.genePool.length}, best ${this.currentContext.best ? this.currentContext.best.fitness : 0}`);
        } while (!this.finishCondition(this.currentContext));

        return this.currentContext;
    }

    public getGeneration(): IGeneration<TGene> {
        return {
            genePool: [ ...this.currentContext.currentGeneration.genePool ],
            number: this.currentContext.currentGeneration.number,
        };
    }
}
