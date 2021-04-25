import IGAContext from "./iGAContext";
import IGAProblem from "./iGAProblem";
import IGene from "./iGene";

export default interface IGeneFilter<TProblem extends IGAProblem<TGene>, TGene extends IGene> {
    filter(context: IGAContext<TProblem, TGene>): TGene[];
}
