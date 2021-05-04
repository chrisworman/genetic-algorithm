import { GARunEvent } from "./gaRunEvent";
import { IChromosome } from "./iChromosome";
import { IGAContext } from "./iGAContext";
import { IGAContextFactory } from "./iGAContextFactory";
import { IOperator } from "./iOperator";
import { IPopulation } from "./iPopulation";
import { IProblem } from "./iProblem";
import { ISelector } from "./iSelector";

export interface IGABuilder<
    TProblem extends IProblem<TChromosome>,
    TChromosome extends IChromosome,
> {
    withProblem(problem: TProblem): IGABuilder<TProblem, TChromosome>;

    withContextFactory(
        contextFactory: IGAContextFactory<TProblem, TChromosome>,
    ): IGABuilder<TProblem, TChromosome>;

    withElitism(getElitism: (
        context: IGAContext<TProblem, TChromosome>) => number,
    ): IGABuilder<TProblem, TChromosome>;

    withInitialPopulation(
        initialPopulation: IPopulation<TChromosome>,
    ): IGABuilder<TProblem, TChromosome>;

    withSelector(
        selector: ISelector<TProblem, TChromosome>,
    ): IGABuilder<TProblem, TChromosome>;

    withOperator(
        operator: IOperator<TProblem, TChromosome>,
    ): IGABuilder<TProblem, TChromosome>;

    withFinishCondition(
        finishCondition: (context: IGAContext<TProblem, TChromosome>) => boolean,
    ): IGABuilder<TProblem, TChromosome>;

    on(
        event: GARunEvent,
        handler: (context: IGAContext<TProblem, TChromosome>) => void,
    ): IGABuilder<TProblem, TChromosome>;
}
