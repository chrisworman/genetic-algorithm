import GA from "./ga";
import IGAContext from "./interfaces/iGAContext";
import IGAProblem from "./interfaces/iGAProblem";
import IGene from "./interfaces/iGene";
import IGeneFilter from "./interfaces/iGeneFilter";
import IGeneGenerator from "./interfaces/iGeneGenerator";

export default class GABuilder<TProblem extends IGAProblem<TGene>, TGene extends IGene> {
    private problem: TProblem;
    private geneGenerators: Array<IGeneGenerator<TProblem, TGene>>;
    private geneFilters: Array<IGeneFilter<TProblem, TGene>>;
    private finishCondition: (context: IGAContext<TProblem, TGene>) => boolean;

    public constructor() {
        this.geneGenerators = [];
        this.geneFilters = [];
        this.finishCondition = (context) => context.currentGeneration.number > 100; // Default 100
    }

    public withProblem(problem: TProblem): GABuilder<TProblem, TGene> {
        this.problem = problem;
        return this;
    }

    public withGeneGenerator(geneGenerator: IGeneGenerator<TProblem, TGene>): GABuilder<TProblem, TGene> {
        this.geneGenerators.push(geneGenerator);
        return this;
    }

    public withGeneFilter(geneFilter: IGeneFilter<TProblem, TGene>): GABuilder<TProblem, TGene> {
        this.geneFilters.push(geneFilter);
        return this;
    }

    public withFinishCondition(
        finishCondition: (context: IGAContext<TProblem, TGene>) => boolean,
    ): GABuilder<TProblem, TGene> {
        this.finishCondition = finishCondition;
        return this;
    }

    public build(): GA<TProblem, TGene> {
        return new GA<TProblem, TGene>(
            this.problem,
            this.geneGenerators,
            this.geneFilters,
            this.finishCondition,
        );
    }
}
