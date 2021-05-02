import { GARunEvent } from "./interfaces/gaRunEvent";
import IChromosome from "./interfaces/iChromosome";
import IGAContext from "./interfaces/iGAContext";
import IGAContextFactory from "./interfaces/iGAContextFactory";
import { IGARunEventHandler } from "./interfaces/iGARunEventHandler";
import IOperator from "./interfaces/iOperator";
import IPopulation from "./interfaces/iPopulation";
import IProblem from "./interfaces/iProblem";
import ISelector from "./interfaces/iSelector";

export default class GA<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    private problem: TProblem;
    private contextFactory: IGAContextFactory<TProblem, TChromosome>;
    private currentContext: IGAContext<TProblem, TChromosome>;
    private initialPopulation: IPopulation<TChromosome>;
    private getElitism: (context: IGAContext<TProblem, TChromosome>) => number;
    private selector: ISelector<TProblem, TChromosome>;
    private operators: Array<IOperator<TProblem, TChromosome>>;
    private finishCondition: (context: IGAContext<TProblem, TChromosome>) => boolean;
    private eventHandlers: Map<GARunEvent, Array<IGARunEventHandler<TProblem, TChromosome>>>;

    public constructor(
        problem: TProblem,
        contextFactory: IGAContextFactory<TProblem, TChromosome>,
        initialPopulation: IPopulation<TChromosome>,
        getElitism: (context: IGAContext<TProblem, TChromosome>) => number,
        selector: ISelector<TProblem, TChromosome>,
        operators: Array<IOperator<TProblem, TChromosome>>,
        finishCondition: (context: IGAContext<TProblem, TChromosome>) => boolean,
        eventHandlers: Map<GARunEvent, Array<IGARunEventHandler<TProblem, TChromosome>>>,
    ) {
        this.problem = problem;
        this.contextFactory = contextFactory;
        this.initialPopulation = initialPopulation;
        this.getElitism = getElitism;
        this.selector = selector;
        this.operators = operators;
        this.finishCondition = finishCondition;
        this.eventHandlers = eventHandlers;
    }

    public run(): IGAContext<TProblem, TChromosome> {
        this.currentContext = this.contextFactory.createContext(this.problem, this.initialPopulation);
        do {
            // Perform reproduction selector
            this.currentContext.selection = this.selector.select(this.currentContext);
            this.currentContext.fittest = this.currentContext.population.getNFittest(1)[0];
            this.callHandlers("selected");

            // Apply elitism
            const nextEpochChromosomes: TChromosome[] = this.getElitism
                ? this.currentContext.population.getNFittest(this.getElitism(this.currentContext))
                : [];

            // Perform operators (crossover, mutations, etc.)
            this.operators.forEach((operator) => {

                this.currentContext.currentOperator = operator;
                this.callHandlers("operatorStart");

                const generatedChromosomes = operator.operate(this.currentContext);
                generatedChromosomes.forEach((chromosome) => {
                    const fitness = this.currentContext.getFitness(chromosome);
                    chromosome.setFitness(fitness);
                    if (!this.currentContext.fittest || fitness > this.currentContext.fittest.getFitness()) {
                        this.currentContext.fittest = chromosome;
                    }
                });
                nextEpochChromosomes.push(...generatedChromosomes);

                this.callHandlers("operatorFinish");
                this.currentContext.currentOperator = undefined;

            });

            this.currentContext.population.newEpoch(nextEpochChromosomes);
            this.callHandlers("newEpoch");
        } while (!this.finishCondition(this.currentContext));

        return this.currentContext;
    }

    private callHandlers(event: GARunEvent) {
        this.eventHandlers.get(event)?.forEach((h) => h(this.currentContext));
    }
}
