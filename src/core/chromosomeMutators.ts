import { IChromosome } from "../core/interfaces/iChromosome";

export class ChromosomeMutators {
    public static applyGeneMutator<TChromosome extends IChromosome<TGene>, TGene>(
        chromosomes: TChromosome[],
        mutate: (item: TGene) => TGene,
        getMutationCount: number | ((chromosome: TChromosome) => number),
        getTargetGeneIndices?: (chromosome: TChromosome) => number[],
    ): TChromosome[] {
        return chromosomes.map((chromosome) => {
            const clone = chromosome.clone() as TChromosome;
            const mutationCount = typeof getMutationCount === "number"
                ? getMutationCount
                : getMutationCount(chromosome);
            for (let i = 0; i < mutationCount; i++) {
                const randomIndex = ChromosomeMutators.getRandomGeneIndex(chromosome, getTargetGeneIndices);
                clone.setGeneAt(randomIndex, mutate(chromosome.getGeneAt(randomIndex)));
            }
            return clone;
        });
    }

    public static swapGenes<TChromosome extends IChromosome<TGene>, TGene>(
        chromosomes: TChromosome[],
        getNumberOfSwaps: number | ((chromosome: TChromosome) => number),
        getTargetGeneIndices?: (chromosome: TChromosome) => number[],
    ): TChromosome[] {
        return chromosomes.map((chromosome) => {
            const result = chromosome.clone() as TChromosome;
            const swaps = typeof getNumberOfSwaps === "number" ? getNumberOfSwaps : getNumberOfSwaps(chromosome);
            for (let i = 0; i < swaps; i++) {
                const r1 = ChromosomeMutators.getRandomGeneIndex(chromosome, getTargetGeneIndices);
                const r2 = ChromosomeMutators.getRandomGeneIndex(chromosome, getTargetGeneIndices);
                const r1Gene = result.getGeneAt(r1);
                const r2Gene = result.getGeneAt(r2);
                result.setGeneAt(r1, r2Gene);
                result.setGeneAt(r2, r1Gene);
            }
            return result;
        });
    }

    private static getRandomGeneIndex<TChromosome extends IChromosome<TGene>, TGene>(
        chromosome: TChromosome,
        getTargetGeneIndices?: (chromosome: TChromosome) => number[],
    ): number {
        if (getTargetGeneIndices) {
            const targetIndices = getTargetGeneIndices(chromosome);
            const randomTargetGeneIndex = Math.floor(Math.random() * targetIndices.length);
            return targetIndices[randomTargetGeneIndex];
        }

        return Math.floor(Math.random() * chromosome.getGeneCount());
    }
}
