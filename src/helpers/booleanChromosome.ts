import IChromosome from "../interfaces/iChromosome";

// A chromosome that efficiently stores boolean genes as binary numbers.
export default class BooleanChromosome implements IChromosome<boolean> {
    private static fromGeneNumbers(numberOfGenes: number, geneNumbers: number[]): BooleanChromosome {
        const result = new BooleanChromosome();
        result.geneNumbers = geneNumbers;
        result.numberOfGenes = numberOfGenes;
        return result;
    }

    private age: number;
    private numberOfGenes: number;
    private geneNumbers: number[]; // The bits of the genes
    private cachedSerialized: string | null;
    private fitness: number;

    public constructor(bits?: boolean[]) {
        this.age = 0;
        this.cachedSerialized = null;
        this.geneNumbers = [];
        if (bits) {
            this.numberOfGenes = bits.length;
            bits.forEach((bit, index) => {
                this.setGeneAt(index, bit);
            });
        }
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

    public clone(): IChromosome<boolean> {
        const result = BooleanChromosome.fromGeneNumbers(this.numberOfGenes, [...this.geneNumbers]);
        result.setFitness(this.fitness);
        return result;
    }

    public deserialize(serialized: string): IChromosome<boolean> {
        const [numberOfGenes, geneNumbers, fitness ] = JSON.parse(serialized);
        const result = BooleanChromosome.fromGeneNumbers(geneNumbers, numberOfGenes);
        result.setFitness(fitness);
        return result;
    }

    public serialize(): string {
        if (!this.cachedSerialized) {
            this.cachedSerialized = JSON.stringify([
                this.numberOfGenes,
                this.geneNumbers,
                this.fitness,
            ]);
        }
        return this.cachedSerialized;
    }

    public getGeneCount(): number {
        return this.numberOfGenes;
    }

    public setGeneAt(index: number, gene: boolean) {
        this.cachedSerialized = null;
        //     geneNumbersIndex = Math.floor(index / 32);
        //         eg. 0 => 0 ... 32 => 0, 32 => 1
        //     numberOffset = index % 32
        //         eg. 0 => 0, 1 => 1, ... 31 => 31, 32 => 0, 33 => 1
        const geneNumberIndex = this.getGeneNumberIndex(index);
        let geneNumber = this.geneNumbers[geneNumberIndex] || 0;
        const numberOffset = this.getNumberOffset(index);
        if (gene) {
            // tslint:disable-next-line: no-bitwise
            geneNumber |= 1 << numberOffset;
        } else {
            // tslint:disable-next-line: no-bitwise
            geneNumber &= ~(1 << numberOffset);
        }
        this.geneNumbers[geneNumberIndex] = geneNumber;
        this.cachedSerialized = null;
    }

    public getGeneAt(index: number): boolean {
        const geneNumberIndex = this.getGeneNumberIndex(index);
        const geneNumber = this.geneNumbers[geneNumberIndex];
        if (!geneNumber) {
            return false;
        }
        const numberOffset = this.getNumberOffset(index);
        // tslint:disable-next-line: no-bitwise
        return (geneNumber & (1 << numberOffset)) !== 0;
    }

    public getRandomGene(): boolean {
        return this.getGeneAt(this.getRandomGeneIndex());
    }

    public getRandomGeneIndex(): number {
       return Math.floor(Math.random() * this.getGeneCount());
    }

    private getGeneNumberIndex(index: number): number {
        return Math.floor(index / 32);
    }

    private getNumberOffset(index: number): number {
        return index % 32;
    }
}
