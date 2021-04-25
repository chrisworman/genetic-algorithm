import IChromosome from "../interfaces/iChromosome";

export default class ChromosomeMutators {
    public static applyGeneMutator<TChromosome extends IChromosome<TGene>, TGene>(
        chromosome: TChromosome,
        n: number,
        mutator: (item: TGene) => TGene,
    ): TChromosome {
        const result = chromosome.clone();
        const geneCount = chromosome.getGeneCount();
        for (let i = 0; i < n; i++) {
            const randomIndex = Math.floor(Math.random() * geneCount);
            result[randomIndex] = mutator(chromosome[randomIndex]);
        }
        return result as TChromosome;
    }
}
