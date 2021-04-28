import IChromosome from "../interfaces/iChromosome";

export default class ChromosomeCombiners {
    public static alternateGenes<TChromosome extends IChromosome<TGene>, TGene>(
        c1: TChromosome,
        c2: TChromosome,
    ): TChromosome[] {
        const r1 = c1.clone();
        let geneCount = r1.getGeneCount();
        for (let i = 0; i < geneCount; i += 2) {
            r1.setGeneAt(i, c2.getGeneAt(i));
        }

        const r2 = c2.clone();
        geneCount = r2.getGeneCount();
        for (let i = 0; i < geneCount; i += 2) {
            r2.setGeneAt(i, c1.getGeneAt(i));
        }

        return [r1 as TChromosome, r2 as TChromosome];
    }

    public static crossover<TChromosome extends IChromosome<TGene>, TGene>(
        c1: TChromosome,
        c2: TChromosome,
    ): TChromosome[] {
        const r1 = c1.clone();
        let geneCount = r1.getGeneCount();
        for (let i = Math.floor(geneCount * 0.5); i < geneCount; i++) {
            r1.setGeneAt(i, c2.getGeneAt(i));
        }

        const r2 = c2.clone();
        geneCount = r2.getGeneCount();
        for (let i = Math.floor(geneCount * 0.5); i < geneCount; i++) {
            r2.setGeneAt(i, c1.getGeneAt(i));
        }
        return [r1 as TChromosome, r2 as TChromosome];
    }
}
