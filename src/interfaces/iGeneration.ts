import IGene from "./iGene";

export default interface IGeneration<TGene extends IGene> {
    number: number;
    genePool: TGene[];
}
