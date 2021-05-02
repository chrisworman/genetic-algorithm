export default interface IChromosome<TGene = {}> {
    getAge: () => number;
    incrementAge: () => void;
    getFitness: () => number;
    setFitness: (fitness: number) => void;
    deserialize: (serialized: string, resetAge?: boolean) => IChromosome<TGene>;
    serialize: () => string;
    clone: () => IChromosome<TGene>;
    getGeneCount: () => number;
    setGeneAt: (index: number, gene: TGene) => void;
    getGeneAt: (index: number) => TGene;
    getRandomGene: () => TGene;
    getRandomGeneIndex: () => number;
}
