import { IChromosome } from "../interfaces/iChromosome";

// An array-based implementation of IChromosome
// TODO: consider constraining TArrayChromosomeGene to be number | string | boolean since this solution
// relies on serialization / deserialization.  Perhaps rename to PrimitiveArrayChromosome?
export class ArrayChromosome<TGene> implements IChromosome<TGene> {
    public age: number;
    private array: TGene[];
    private cachedSerialized: string | null;
    private fitness: number;

    public constructor(initialArray?: TGene[]) {
        this.age = 0;
        this.array = initialArray ? initialArray : [];
        this.cachedSerialized = null;
    }

    public getFitness() {
        return this.fitness;
    }

    public setFitness(fitness: number) {
        this.cachedSerialized = null;
        this.fitness = fitness;
    }

    public getAge() {
        return this.age;
    }

    public incrementAge() {
        this.age++;
    }

    public clone(): IChromosome<TGene> {
        return this.deserialize(this.serialize());
    }

    public deserialize(serialized: string): IChromosome<TGene> {
        const deserialized = JSON.parse(serialized);
        const result = new ArrayChromosome<TGene>(deserialized.array);
        result.setFitness(deserialized.fitness);
        return result;
    }

    public serialize(): string {
        if (!this.cachedSerialized) {
            this.cachedSerialized = JSON.stringify({
                array: this.array,
                fitness: this.fitness,
            });
        }
        return this.cachedSerialized;
    }

    public getGeneCount(): number {
        return this.array.length;
    }

    public setGeneAt(index: number, gene: TGene) {
        this.cachedSerialized = null;
        this.array[index] = gene;
    }

    public getGeneAt(index: number): TGene {
        return this.array[index];
    }

    public getRandomGene(): TGene {
        return this.getGeneAt(this.getRandomGeneIndex());
    }

    public getRandomGeneIndex(): number {
       return Math.floor(Math.random() * this.getGeneCount());
    }

    public toArray(): TGene[] {
        return [ ...this.array ];
    }
}
