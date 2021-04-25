import IChromosome from "../interfaces/iChromosome";

export default class ChromosomeSelectors {
    public static randomUnique<TChromosome extends IChromosome<TGene>, TGene>(
        chromosomes: TChromosome[],
        count: number = 1,
    ): TChromosome[] {
        const result: TChromosome[] = [];
        const generatedIndices = new Set<number>();
        for (let i = 0; i < count; i++) {
            let nextIndex = 0;
            do {
                nextIndex = Math.floor(Math.random() * chromosomes.length);
            } while (generatedIndices.has(nextIndex));
            generatedIndices.add(nextIndex);
            result.push(chromosomes[nextIndex]);
        }
        return result;
    }
}
