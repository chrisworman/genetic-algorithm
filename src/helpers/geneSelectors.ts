import IGene from "../interfaces/iGene";

export default class GeneSelectors {
    public static randomUnique<TGene extends IGene>(genePool: TGene[], count: number = 1): TGene[] {
        const result: TGene[] = [];
        const generatedIndices = new Set<number>();
        for (let i = 0; i < count; i++) {
            let nextIndex = 0;
            do {
                nextIndex = Math.floor(Math.random() * genePool.length);
            } while (generatedIndices.has(nextIndex));
            generatedIndices.add(nextIndex);
            result.push(genePool[nextIndex]);
        }
        return result;
    }
}
