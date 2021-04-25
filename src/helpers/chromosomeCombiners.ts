import IChromosome from "../interfaces/iChromosome";

export default class ChromosomeCombiners {
    public static alternateGenes<TChromosome extends IChromosome<TGene>, TGene>(
        c1: TChromosome,
        c2: TChromosome,
    ): TChromosome {
        const result = c1.clone();
        const geneCount = result.getGeneCount();
        for (let i = 0; i < geneCount; i += 2) {
            result.setGeneAt(i, c2.getGeneAt(i));
        }
        return result as TChromosome;
    }
}
