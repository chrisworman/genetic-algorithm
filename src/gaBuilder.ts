import GA from "./ga";
import IChromosome from "./interfaces/iChromosome";
import IChromosomeFilter from "./interfaces/iChromosomeFilter";
import IChromosomeGenerator from "./interfaces/iChromosomeGenerator";
import IGAContext from "./interfaces/iGAContext";
import IGAProblem from "./interfaces/iGAProblem";

export default class GABuilder<
    TProblem extends IGAProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    private problem: TProblem;
    private chromosomeGenerators: Array<IChromosomeGenerator<TProblem, TChromosome, TGene>>;
    private chromosomeFilters: Array<IChromosomeFilter<TProblem, TChromosome, TGene>>;
    private finishCondition: (context: IGAContext<TProblem, TChromosome, TGene>) => boolean;

    public constructor() {
        this.chromosomeGenerators = [];
        this.chromosomeFilters = [];
        this.finishCondition = (context) => context.population.number > 100; // Default 100 generations
    }

    public withProblem(problem: TProblem): GABuilder<TProblem, TChromosome, TGene> {
        this.problem = problem;
        return this;
    }

    public withChromosomeGenerator(
        chromosomeGenerator: IChromosomeGenerator<TProblem, TChromosome, TGene>,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.chromosomeGenerators.push(chromosomeGenerator);
        return this;
    }

    public withChromosomeFilter(
        chromosomeFilter: IChromosomeFilter<TProblem, TChromosome, TGene>,
    ): GABuilder<TProblem, TChromosome, TGene> {
        this.chromosomeFilters.push(chromosomeFilter);
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
            this.chromosomeGenerators,
            this.chromosomeFilters,
            this.finishCondition,
        );
    }
}
