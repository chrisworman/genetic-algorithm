import { BooleanChromosome } from "../../core/booleanChromosome";
import { IProblem } from "../../core/interfaces/iProblem";
import { IGraphEdge } from "./iGraphEdge";

export class MISProblem implements IProblem<BooleanChromosome> {
    private neighbours: Map<number, Set<number>>;

    constructor(edges: IGraphEdge[]) {
        this.neighbours = new Map();
        edges.forEach((edge) => {
            const v1Neighbours = this.neighbours.get(edge.v1);
            if (v1Neighbours) {
                v1Neighbours.add(edge.v2);
            } else {
                this.neighbours.set(edge.v1, new Set([edge.v2]));
            }
            const v2Neighbours = this.neighbours.get(edge.v2);
            if (v2Neighbours) {
                v2Neighbours.add(edge.v1);
            } else {
                this.neighbours.set(edge.v2, new Set([edge.v1]));
            }
        });
    }

    public getVertexCount(): number {
        return this.neighbours.size;
    }

    public getFitness(chromosome: BooleanChromosome): number {
        // 1. If indepedent set, score is number of "true" bits
        let vertexCount = 0;
        const geneCount = chromosome.getGeneCount();
        for (let i = 0; i < geneCount; i++) {

            if (!chromosome.getGeneAt(i)) { continue; } // vi is not in the independent set

            vertexCount++; // count vi

            const neighbours = this.neighbours.get(i);
            if (!neighbours || neighbours.size === 0) { continue; } // vi is isolated

            for (const j of neighbours) {
                if (j > i // Optimization: don't revisit edges
                    && chromosome.getGeneAt(j)
                ) {
                    return 0; // edge in independent set not allowed
                }
            }
        }
        return vertexCount;
    }
}
