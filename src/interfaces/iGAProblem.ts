import IGene from "./iGene";

export default interface IGAProblem<TGene extends IGene> {
    getFitness(gene: TGene): number;
}
