import IChromosome from "./interfaces/iChromosome";
import IGAContext from "./interfaces/iGAContext";
import IOperator from "./interfaces/iOperator";
import IPopulation from "./interfaces/iPopulation";
import IProblem from "./interfaces/iProblem";
import ISelector from "./interfaces/iSelector";

export default class GA<
    TProblem extends IProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    private problem: TProblem;
    private initialPopulation: IPopulation<TChromosome, TGene>;
    private elitism: number;
    private selector: ISelector<TProblem, TChromosome, TGene>;
    private operators: Array<IOperator<TProblem, TChromosome, TGene>>;
    private finishCondition: (context: IGAContext<TProblem, TChromosome, TGene>) => boolean;
    private currentContext: IGAContext<TProblem, TChromosome, TGene>;

    constructor(
        problem: TProblem,
        elitism: number,
        initialPopulation: IPopulation<TChromosome, TGene>,
        operators: Array<IOperator<TProblem, TChromosome, TGene>>,
        selector: ISelector<TProblem, TChromosome, TGene>,
        finishCondition: (context: IGAContext<TProblem, TChromosome, TGene>) => boolean,
    ) {
        this.problem = problem;
        this.elitism = elitism;
        this.initialPopulation = initialPopulation;
        this.operators = operators;
        this.selector = selector;
        this.finishCondition = finishCondition;
    }

    public run(): IGAContext<TProblem, TChromosome, TGene> {
        let fitnessCache = new Map<string, number>();
        // TODO: extract into class
        this.currentContext = {
            getFitness: (chromosome) => {
                if (fitnessCache.size > 100000) {
                    fitnessCache = new Map<string, number>();
                }
                const serializedGene = chromosome.serialize();
                let fitness = fitnessCache.get(serializedGene);
                if (fitness === undefined) {
                    fitness = this.problem.getFitness(chromosome);
                    fitnessCache.set(serializedGene, fitness);
                }
                return fitness;
            },
            population: this.initialPopulation,
            problem: this.problem,
        };
        do {
            // Perform reproduction selector
            const selector = this.selector.select(this.currentContext);

            // Apply elitism
            const nextEpochChromosomes: TChromosome[] = this.currentContext.population.getNFittest(this.elitism);

            // Perform reproduction operators (crossover, mutations, etc.)
            this.operators.forEach((operator) => {
                const generatedChromosomes = operator.operate(this.currentContext, selector);
                // TODO: move to IPopulation.addIfNew
                generatedChromosomes.forEach((chromosome) => {
                    const fitness = this.currentContext.getFitness(chromosome);
                    chromosome.setFitness(fitness);
                    if (!this.currentContext.best || fitness > this.currentContext.best.fitness) {
                        this.currentContext.best = { chromosome, fitness };
                    }
                });
                // nextEpochChromosomes = nextEpochChromosomes.concat(generatedChromosomes);
                nextEpochChromosomes.push(...generatedChromosomes);
            });

            this.currentContext.population.newEpoch(nextEpochChromosomes);
            console.log(`#${this.currentContext.population.getEpoch()} size ${this.currentContext.population.size()} best ${this.currentContext.best ? this.currentContext.best.fitness : 0}`);
        } while (!this.finishCondition(this.currentContext));

        return this.currentContext;
    }
}
