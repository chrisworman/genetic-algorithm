import IChromosome from "./interfaces/iChromosome";
import IGAContext from "./interfaces/iGAContext";
import IGAContextFactory from "./interfaces/iGAContextFactory";
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
    private contextFactory: IGAContextFactory<TProblem, TChromosome, TGene>;
    private currentContext: IGAContext<TProblem, TChromosome, TGene>;
    private initialPopulation: IPopulation<TChromosome, TGene>;
    private elitism: number;
    private selector: ISelector<TProblem, TChromosome, TGene>;
    private operators: Array<IOperator<TProblem, TChromosome, TGene>>;
    private finishCondition: (context: IGAContext<TProblem, TChromosome, TGene>) => boolean;

    constructor(
        problem: TProblem,
        contextFactory: IGAContextFactory<TProblem, TChromosome, TGene>,
        initialPopulation: IPopulation<TChromosome, TGene>,
        elitism: number,
        selector: ISelector<TProblem, TChromosome, TGene>,
        operators: Array<IOperator<TProblem, TChromosome, TGene>>,
        finishCondition: (context: IGAContext<TProblem, TChromosome, TGene>) => boolean,
    ) {
        this.problem = problem;
        this.contextFactory = contextFactory;
        this.initialPopulation = initialPopulation;
        this.elitism = elitism;
        this.selector = selector;
        this.operators = operators;
        this.finishCondition = finishCondition;
    }

    public run(): IGAContext<TProblem, TChromosome, TGene> {
        this.currentContext = this.contextFactory.createContext(this.problem, this.initialPopulation);
        do {
            // Perform reproduction selector
            this.currentContext.selection = this.selector.select(this.currentContext);

            // Apply elitism
            const nextEpochChromosomes: TChromosome[] = this.currentContext.population.getNFittest(this.elitism);

            // Perform operators (crossover, mutations, etc.)
            this.operators.forEach((operator) => {
                const generatedChromosomes = operator.operate(this.currentContext);
                generatedChromosomes.forEach((chromosome) => {
                    const fitness = this.currentContext.getFitness(chromosome);
                    chromosome.setFitness(fitness);
                    if (!this.currentContext.fittest || fitness > this.currentContext.fittest.getFitness()) {
                        this.currentContext.fittest = chromosome;
                    }
                });
                nextEpochChromosomes.push(...generatedChromosomes);
            });

            this.currentContext.population.newEpoch(nextEpochChromosomes);
            console.log(`#${this.currentContext.population.getEpoch()} size ${this.currentContext.population.size()} best ${this.currentContext.fittest ? this.currentContext.fittest.getFitness() : 0}`);
        } while (!this.finishCondition(this.currentContext));

        return this.currentContext;
    }
}
