import GA from "./ga";
import IChromosome from "./interfaces/iChromosome";
import IGAContext from "./interfaces/iGAContext";
import IOperator from "./interfaces/iOperator";
import IPopulation from "./interfaces/iPopulation";
import IProblem from "./interfaces/iProblem";
import ISelector from "./interfaces/iSelector";

export default class GABuilder<
    TProblem extends IProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    private problem: TProblem;
    private elitism: number;
    private initialPopulation: IPopulation<TChromosome, TGene>;
    private operators: Array<IOperator<TProblem, TChromosome, TGene>>;
    private selector: ISelector<TProblem, TChromosome, TGene>;
    private finishCondition: (context: IGAContext<TProblem, TChromosome, TGene>) => boolean;

    public constructor() {
        this.elitism = 0;
        this.operators = [];
        this.finishCondition = (context) => context.population.getEpoch() > 100; // Default 100 epochs
    }

    public withProblem(problem: TProblem): GABuilder<TProblem, TChromosome, TGene> {
        this.problem = problem;
        return this;
    }

    public withElitism(elitism: number = 1): GABuilder<TProblem, TChromosome, TGene> {
        this.elitism = elitism;
        return this;
    }

    public withInitialPopulation(
        initialPopulation: IPopulation<TChromosome, TGene>,
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

    public build(): GA<TProblem, TChromosome, TGene> {
        return new GA<TProblem, TChromosome, TGene>(
            this.problem,
            this.elitism,
            this.initialPopulation,
            this.operators,
            this.selector,
            this.finishCondition,
        );
    }
}
