import GABuilder from "../gaBuilder";
import { GARunEvent } from "./gaRunEvent";
import IChromosome from "./iChromosome";
import IGAContext from "./iGAContext";
import IGAContextFactory from "./iGAContextFactory";
import IOperator from "./iOperator";
import IPopulation from "./iPopulation";
import IProblem from "./iProblem";
import ISelector from "./iSelector";

export default interface IGABuilder<
    TProblem extends IProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
    TGene,
> {
    withProblem(problem: TProblem): GABuilder<TProblem, TChromosome, TGene>;

    withContextFactory(
        contextFactory: IGAContextFactory<TProblem, TChromosome, TGene>,
    ): GABuilder<TProblem, TChromosome, TGene>;

    withElitism(getElitism: (
        context: IGAContext<TProblem, TChromosome, TGene>) => number,
    ): GABuilder<TProblem, TChromosome, TGene>;

    withInitialPopulation(
        initialPopulation: IPopulation<TChromosome, TGene>,
    ): GABuilder<TProblem, TChromosome, TGene>;

    withSelector(
        selector: ISelector<TProblem, TChromosome, TGene>,
    ): GABuilder<TProblem, TChromosome, TGene>;

    withOperator(
        operator: IOperator<TProblem, TChromosome, TGene>,
    ): GABuilder<TProblem, TChromosome, TGene>;

    withFinishCondition(
        finishCondition: (context: IGAContext<TProblem, TChromosome, TGene>) => boolean,
    ): GABuilder<TProblem, TChromosome, TGene>;

    on(
        event: GARunEvent,
        handler: (context: IGAContext<TProblem, TChromosome, TGene>) => void,
    ): GABuilder<TProblem, TChromosome, TGene>;
}
