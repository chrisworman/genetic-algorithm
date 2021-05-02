import GA from "./ga";
import CachedFitnessGAContext from "./helpers/cachedFitnessGAContext";
import { GARunEvent } from "./interfaces/gaRunEvent";
import IChromosome from "./interfaces/iChromosome";
import IGABuilder from "./interfaces/iGABuilder";
import IGAContext from "./interfaces/iGAContext";
import IGAContextFactory from "./interfaces/iGAContextFactory";
import { IGARunEventHandler } from "./interfaces/iGARunEventHandler";
import IOperator from "./interfaces/iOperator";
import IPopulation from "./interfaces/iPopulation";
import IProblem from "./interfaces/iProblem";
import ISelector from "./interfaces/iSelector";

export default class GABuilder<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> implements IGABuilder<TProblem, TChromosome, TGene> {
    private static DEFAULT_MAX_EPOCHS = 500;
    private static DEFAULT_SELECTOR_N_FITTEST = 500;
    private problem: TProblem;
    private contextFactory: IGAContextFactory<TProblem, TChromosome, TGene>;
    private initialPopulation: IPopulation<TChromosome>;
    private getElitism: (context: IGAContext<TProblem, TChromosome, TGene>) => number;
    private selector: ISelector<TProblem, TChromosome, TGene>;
    private operators: Array<IOperator<TProblem, TChromosome, TGene>>;
    private finishCondition: (context: IGAContext<TProblem, TChromosome, TGene>) => boolean;
    private eventHandlers: Map<GARunEvent, Array<IGARunEventHandler<TProblem, TChromosome, TGene>>>;

    public constructor() {
        this.operators = [];
        this.eventHandlers = new Map();

        // Set reasonable defaults which can be overwritten
        this.contextFactory = CachedFitnessGAContext.getFactory();
        this.selector = {
            select: (context) => context.population.getNFittest(GABuilder.DEFAULT_SELECTOR_N_FITTEST),
        };
        this.finishCondition = (context) => context.population.getEpoch() > GABuilder.DEFAULT_MAX_EPOCHS;
    }

    public withProblem(problem: TProblem): GABuilder<TProblem, TChromosome, TGene> {
        this.problem = problem;
        return this;
    }

    public withContextFactory(
        contextFactory: IGAContextFactory<TProblem, TChromosome, TGene>,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.contextFactory = contextFactory;
        return this;
    }

    public withElitism(
        getElitism: (context: IGAContext<TProblem, TChromosome, TGene>) => number,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.getElitism = getElitism;
        return this;
    }

    public withInitialPopulation(
        initialPopulation: IPopulation<TChromosome>,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.initialPopulation = initialPopulation;
        return this;
    }

    public withSelector(
        selector: ISelector<TProblem, TChromosome, TGene>,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.selector = selector;
        return this;
    }

    public withOperator(
        operator: IOperator<TProblem, TChromosome, TGene>,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.operators.push(operator);
        return this;
    }

    public withFinishCondition(
        finishCondition: (context: IGAContext<TProblem, TChromosome, TGene>) => boolean,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.finishCondition = finishCondition;
        return this;
    }

    public on(
        event: GARunEvent,
        handler: IGARunEventHandler<TProblem, TChromosome, TGene>,
    ): GABuilder<TProblem, TChromosome, TGene> {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.push(handler);
        } else {
            this.eventHandlers.set(event, [handler]);
        }
        return this;
    }

    public build(): GA<TProblem, TChromosome, TGene> {
        return new GA<TProblem, TChromosome, TGene>(
            this.problem,
            this.contextFactory,
            this.initialPopulation,
            this.getElitism,
            this.selector,
            this.operators,
            this.finishCondition,
            this.eventHandlers,
        );
    }
}
