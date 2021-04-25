import IGAContext from "./iGAContext";
import IGAProblem from "./iGAProblem";
import IGene from "./iGene";

export default interface IGeneGenerator<TProblem extends IGAProblem<TGene>, TGene extends IGene> {
    generate(context: IGAContext<TProblem, TGene>): TGene[];
}
