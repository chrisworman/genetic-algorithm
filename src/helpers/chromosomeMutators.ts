import IChromosome from "../interfaces/iChromosome";

export default class ChromosomeMutators {
    public static applyGeneMutator<TChromosome extends IChromosome<TGene>, TGene>(
        chromosome: TChromosome,
        numberOfMutations: number,
        mutator: (item: TGene) => TGene,
        targetGeneIndices?: number[],
    ): TChromosome {
        const result = chromosome.clone();
        const geneCount = chromosome.getGeneCount();
        for (let i = 0; i < numberOfMutations; i++) {
            const randomIndex = ChromosomeMutators.getRandomGeneIndex(geneCount, targetGeneIndices);
            result.setGeneAt(randomIndex, mutator(chromosome.getGeneAt(randomIndex)));
        }
        return result as TChromosome;
    }

    public static swapGenes<TChromosome extends IChromosome<TGene>, TGene>(
        chromosome: TChromosome,
        numberOfSwaps: number,
        targetGeneIndices?: number[],
    ): TChromosome {
        const result = chromosome.clone();
        const geneCount = chromosome.getGeneCount();
        for (let i = 0; i < numberOfSwaps; i++) {
            const r1 = ChromosomeMutators.getRandomGeneIndex(geneCount, targetGeneIndices);
            const r2 = ChromosomeMutators.getRandomGeneIndex(geneCount, targetGeneIndices);
            const r1Gene = result.getGeneAt(r1);
            const r2Gene = result.getGeneAt(r2);
            result.setGeneAt(r1, r2Gene);
            result.setGeneAt(r2, r1Gene);
        }
        return result as TChromosome;
    }

    private static getRandomGeneIndex(geneCount: number, targetGeneIndices?: number[]): number {
        if (targetGeneIndices) {
            const randomTargetGeneIndex = Math.floor(Math.random() * targetGeneIndices.length);
            return targetGeneIndices[randomTargetGeneIndex];
        }

        return Math.floor(Math.random() * geneCount);
    }
}
