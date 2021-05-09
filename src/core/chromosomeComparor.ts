import { IChromosome } from "./interfaces";

export class ChromosomeComparor {
    public static getSimilarity<TChromosome extends IChromosome<TGene>, TGene>(
        c1: TChromosome,
        c2: TChromosome,
        geneComparor?: (g1: TGene, g2: TGene) => boolean,
    ): number {
        const geneCount = c1.getGeneCount();
        const genesEqual = geneComparor
            ? geneComparor
            : (g1: TGene, g2: TGene): boolean => g1 === g2;
        let equalCount = 0;
        for (let i = 0; i < geneCount; i++) {
            if (genesEqual(c1.getGeneAt(i), c2.getGeneAt(i))) {
                equalCount++;
            }
        }
        return equalCount / geneCount;
    }
}
