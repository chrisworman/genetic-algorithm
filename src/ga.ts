import IChromosome from "./interfaces/iChromosome";
import IChromosomeFilter from "./interfaces/iChromosomeFilter";
import IChromosomeGenerator from "./interfaces/iChromosomeGenerator";
import IGAContext from "./interfaces/iGAContext";
import IGAProblem from "./interfaces/iGAProblem";
import IPopulation from "./interfaces/iPopulation";

export default class GA<
    TProblem extends IGAProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    private problem: TProblem;
    private chromosomeGenerators: Array<IChromosomeGenerator<TProblem, TChromosome, TGene>>;
    private chromosomeFilters: Array<IChromosomeFilter<TProblem, TChromosome, TGene>>;
    private finishCondition: (context: IGAContext<TProblem, TChromosome, TGene>) => boolean;
    private currentContext: IGAContext<TProblem, TChromosome, TGene>;

    constructor(
        problem: TProblem,
        chromosomeGenerators: Array<IChromosomeGenerator<TProblem, TChromosome, TGene>>,
        chromosomeFilters: Array<IChromosomeFilter<TProblem, TChromosome, TGene>>,
        finishCondition: (context: IGAContext<TProblem, TChromosome, TGene>) => boolean,
    ) {
        this.problem = problem;
        this.chromosomeGenerators = chromosomeGenerators;
        this.chromosomeFilters = chromosomeFilters;
        this.finishCondition = finishCondition;
    }

    public run(): IGAContext<TProblem, TChromosome, TGene> {
        const fitnessCache = new Map<string, number>();
        this.currentContext = {
            getFitness: (chromosome) => {
                const serializedGene = chromosome.serialize();
                let fitness = fitnessCache.get(serializedGene);
                if (fitness === undefined) {
                    fitness = this.problem.getFitness(chromosome);
                    fitnessCache.set(serializedGene, fitness);
                }
                return fitness;
            },
            population: {
                chromosomes: [],
                number: 0,
            },
            problem: this.problem,
        };
        do {
            this.chromosomeGenerators.forEach((generator) => {
                const generatedChromosomes = generator.generate(this.currentContext);
                const combinedChromosomes = this.currentContext.population.chromosomes.concat(generatedChromosomes);
                this.currentContext.population.chromosomes = combinedChromosomes;
            });
            this.chromosomeFilters.forEach((filter) => {
                this.currentContext.population.chromosomes = filter.filter(this.currentContext);
            });
            this.currentContext.population.chromosomes.forEach((chromosome) => {
                const fitness = this.currentContext.getFitness(chromosome);
                if (!this.currentContext.best || fitness > this.currentContext.best.fitness) {
                    this.currentContext.best = { chromosome, fitness };
                }
            });
            this.currentContext.population.chromosomes.forEach((chromosome) => chromosome.age++);
            this.currentContext.population.number++;
            console.log(`generation number ${this.currentContext.population.number}, population size ${this.currentContext.population.chromosomes.length}, best ${this.currentContext.best ? this.currentContext.best.fitness : 0}`);
        } while (!this.finishCondition(this.currentContext));

        return this.currentContext;
    }

    public getPopulation(): IPopulation<TChromosome, TGene> {
        return {
            chromosomes: [ ...this.currentContext.population.chromosomes ],
            number: this.currentContext.population.number,
        };
    }
}
