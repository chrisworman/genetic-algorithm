import IChromosome from "../interfaces/iChromosome";

export default class ArrayChromosome<TArrayChromosomeGene> implements IChromosome<TArrayChromosomeGene> {
    public age: number;
    private array: TArrayChromosomeGene[];
    public constructor(initialArray?: TArrayChromosomeGene[]) {
        this.age = 0;
        this.array = initialArray ? initialArray : [];
    }

    public clone(): IChromosome<TArrayChromosomeGene> {
        return this.deserialize(this.serialize());
    }

    public deserialize(serialized: string): IChromosome<TArrayChromosomeGene> {
        return new ArrayChromosome<TArrayChromosomeGene>(JSON.parse(serialized));
    }

    public serialize(): string {
        return JSON.stringify(this.array);
    }

    public getGeneCount(): number {
        return this.array.length;
    }
    public setGeneAt(index: number, gene: TArrayChromosomeGene) {
        this.array[index] = gene;
    }
    public getGeneAt(index: number): TArrayChromosomeGene {
        return this.array[index];
    }

    public getRandomGene(): TArrayChromosomeGene {
        return this.getGeneAt(this.getRandomGeneIndex());
    }
    public getRandomGeneIndex(): number {
       return Math.floor(Math.random() * this.getGeneCount());
    }
}
