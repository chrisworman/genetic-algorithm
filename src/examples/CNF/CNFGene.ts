import IGene from "../../interfaces/iGene";

export default class CNFGene implements IGene {
    private truthAssignments: boolean[];
    private serializedTruthAssignments: string;
    constructor(truthAssignments: boolean[]) {
        this.truthAssignments = truthAssignments;
        this.serializedTruthAssignments = `${this.truthAssignments.map((t, i) => `${i > 0 ? t ? "1" : "0" : ""}`).join("")}`;
    }

    public getTruthAssignments() {
        return [ ...this.truthAssignments ];
    }

    public serialize(): string {
        return this.serializedTruthAssignments;
    }

    public deserialize(serializedTruthAssignments: string): CNFGene {
        const deserializedTruthAssignments: boolean[] = [];
        for (let i = 0; i < serializedTruthAssignments.length; i++) {
            deserializedTruthAssignments[i + 1] = serializedTruthAssignments.charAt(i) === "1";
        }
        return new CNFGene(deserializedTruthAssignments);
    }
}
