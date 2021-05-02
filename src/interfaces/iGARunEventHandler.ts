import IChromosome from "./iChromosome";
import IGAContext from "./iGAContext";
import IProblem from "./iProblem";

export type IGARunEventHandler<
    TProblem extends IProblem<TChromosome, TGene>,
    TChromosome extends IChromosome<TGene>,
TGene,
> = (context: IGAContext<TProblem, TChromosome, TGene>) => void;
