import { CachedFitnessGAContext } from ".";
import { GA } from "./ga";
import { GARunEvent } from "./interfaces";
import { IChromosome } from "./interfaces";
import { IGABuilder } from "./interfaces/iGABuilder";
import { IGAContext } from "./interfaces/iGAContext";
import { IGAContextFactory } from "./interfaces/iGAContextFactory";
import { IGARunEventHandler } from "./interfaces/iGARunEventHandler";
import { IOperator } from "./interfaces/iOperator";
import { IPopulation } from "./interfaces/iPopulation";
import { IProblem } from "./interfaces/iProblem";
import { ISelector } from "./interfaces/iSelector";

export class GABuilder<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> implements IGABuilder<TProblem, TChromosome> {
    private static DEFAULT_MAX_EPOCHS = 500;
    private static DEFAULT_SELECTOR_N_FITTEST = 500;
    private problem: TProblem;
    private contextFactory: IGAContextFactory<TProblem, TChromosome>;
    private initialPopulation: IPopulation<TChromosome>;
    private getElitism: (context: IGAContext<TProblem, TChromosome>) => number;
    private selector: ISelector<TProblem, TChromosome>;
    private operators: Array<IOperator<TProblem, TChromosome>>;
    private finishCondition: (context: IGAContext<TProblem, TChromosome>) => boolean;
    private eventHandlers: Map<GARunEvent, Array<IGARunEventHandler<TProblem, TChromosome>>>;

    public constructor() {
        // Set reasonable defaults which can be overridden
        this.operators = [];
        this.eventHandlers = new Map();
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
        contextFactory: IGAContextFactory<TProblem, TChromosome>,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.contextFactory = contextFactory;
        return this;
    }

    public withElitism(
        getElitism: (context: IGAContext<TProblem, TChromosome>) => number,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.getElitism = getElitism;
        return this;
    }

    // TODO: consider withInitialChromosomes and then internally GA can use the FRBTPopulation
    // And the consumer doesn't need to know and doesn't need to be exported.
    public withInitialPopulation(
        initialPopulation: IPopulation<TChromosome>,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.initialPopulation = initialPopulation;
        return this;
    }

    public withSelector(
        selector: ISelector<TProblem, TChromosome>,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.selector = selector;
        return this;
    }

    public withOperator(
        operator: IOperator<TProblem, TChromosome>,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.operators.push(operator);
        return this;
    }

    public withFinishCondition(
        finishCondition: (context: IGAContext<TProblem, TChromosome>) => boolean,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.finishCondition = finishCondition;
        return this;
    }

    public on(
        event: GARunEvent,
        handler: IGARunEventHandler<TProblem, TChromosome>,
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
