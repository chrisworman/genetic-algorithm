export default interface IChromosome<TGene> {
    age: number;
    deserialize: (serialized: string) => IChromosome<TGene>;
    serialize: () => string;
    clone: () => IChromosome<TGene>;
    getGeneCount: () => number;
    setGeneAt: (index: number, gene: TGene) => void;
    getGeneAt: (index: number) => TGene;
    getRandomGene: () => TGene;
    getRandomGeneIndex: () => number;
}
