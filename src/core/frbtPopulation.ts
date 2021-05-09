import createTree from "functional-red-black-tree";
import { IChromosome } from "../core/interfaces/iChromosome";
import { IPopulation } from "../core/interfaces/iPopulation";

// A Functional red-black tree implementation of IPopulation
export class FRBTPopulation<
    TChromosome extends IChromosome,
> implements IPopulation<TChromosome> {
    private epoch: number;
    private serializeToChromosome: Map<string, TChromosome>;
    private fitnessToChromosomes: createTree.Tree<number, TChromosome[]>;
    public constructor(initialChromosomes?: TChromosome[]) {
        this.epoch = 1;
        this.serializeToChromosome = new Map();
        this.fitnessToChromosomes = createTree((a, b) => b - a); // most fit to least fit
        if (initialChromosomes) {
            this.addIfNew(initialChromosomes);
        }
    }

    public newEpoch(newChromosomes: TChromosome[]) {
        this.incrementEpoch();
        this.serializeToChromosome = new Map();
        this.fitnessToChromosomes = createTree((a, b) => b - a); // most fit to least fit
        this.addIfNew(newChromosomes);
    }

    public incrementEpoch(): number {
        for (const chromosome of this.serializeToChromosome.values()) {
            chromosome.incrementAge();
        }
        return this.epoch++;
    }

    public getEpoch(): number {
        return this.epoch;
    }

    public getNFittest(n: number): TChromosome[] {
        const result: TChromosome[] = [];
        if (n === 0) {
            return result;
        }
        for (const key of this.fitnessToChromosomes.keys) {
            const chromosomes = this.fitnessToChromosomes.get(key) || [];
            for (const chromosome of chromosomes) {
                result.push(chromosome);
                if (result.length === n) {
                    return result;
                }
            }
        }
        return result;
    }

    public getSize(): number {
        return this.serializeToChromosome.size;
    }

    public removeNLeastFit(n: number): void {
        let leftToRemove = n;
        const keysToRemove: number[] = [];

        for (let i = this.fitnessToChromosomes.keys.length - 1; i >= 0; i--) {
            const key = this.fitnessToChromosomes.keys[i];
            const chromosomes = this.fitnessToChromosomes.get(key) || [];
            if (chromosomes.length <= leftToRemove) {
                keysToRemove.push(key);
                leftToRemove -= chromosomes.length;
            } else {
                const removedChromosomes = chromosomes.splice(0, leftToRemove);
                removedChromosomes.forEach((chromosome) => this.serializeToChromosome.delete(chromosome.serialize()));
                leftToRemove = 0;
            }
            if (leftToRemove <= 0) {
                break;
            }
        }

        keysToRemove.forEach((key) => {
            const chromosomes = this.fitnessToChromosomes.get(key);
            if (chromosomes) {
                chromosomes.forEach((chromosome) => this.serializeToChromosome.delete(chromosome.serialize()));
            }
            this.fitnessToChromosomes = this.fitnessToChromosomes.remove(key);
        });
    }

    public removeUnfit(minFitness: number): void {
        const keysToRemove: number[] = [];

        for (let i = this.fitnessToChromosomes.keys.length - 1; i >= 0; i--) {
            const key = this.fitnessToChromosomes.keys[i];
            if (key < minFitness) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach((key) => {
            const chromosomes = this.fitnessToChromosomes.get(key);
            if (chromosomes) {
                chromosomes.forEach((chromosome) => this.serializeToChromosome.delete(chromosome.serialize()));
            }
            this.fitnessToChromosomes = this.fitnessToChromosomes.remove(key);
        });
    }

    private addIfNew(newChromosomes: TChromosome[]) {
        newChromosomes.forEach((chromosome) => {
            const serialized = chromosome.serialize();
            if (!this.serializeToChromosome.has(serialized)) {
                this.serializeToChromosome.set(serialized, chromosome);
                const fitness = chromosome.getFitness();
                const fitnessChromosomes = this.fitnessToChromosomes.get(fitness);
                if (fitnessChromosomes) {
                    fitnessChromosomes.push(chromosome);
                } else {
                    this.fitnessToChromosomes = this.fitnessToChromosomes.insert(fitness, [chromosome]);
                }
            }
        });
    }
}
