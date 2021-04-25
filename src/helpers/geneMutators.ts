import IGene from "../interfaces/iGene";

export default class GeneMutators {
    public static mutateN<TGeneItem>(
        gene: TGeneItem[],
        n: number,
        mutator: (item: TGeneItem) => TGeneItem,
    ): TGeneItem[] {
        const result: TGeneItem[] = [ ...gene ];
        for (let i = 0; i < n; i++) {
            const randomIndex = Math.floor(Math.random() * gene.length);
            result[randomIndex] = mutator(gene[randomIndex]);
        }
        return result;
    }
}
