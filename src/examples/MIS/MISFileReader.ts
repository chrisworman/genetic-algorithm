import fs from "fs";
import { IGraphEdge } from "./iGraphEdge";
import { MISProblem } from "./MISProblem";

export class MISFileReader {
    public static read(filePath: string): MISProblem {
        const fileText = fs.readFileSync(filePath, "utf8");
        const fileLines = fileText.split("\n");
        const edges: IGraphEdge[] = [];
        for (const line of fileLines) {
            const canonicalLine = line.trim().toLocaleLowerCase();
            if (canonicalLine.startsWith("e")) {
                const [ /* e */, v1, v2] = canonicalLine.split(" ");
                edges.push({ v1: parseInt(v1, 10), v2: parseInt(v2, 10) });
            }
        }
        return new MISProblem(edges);
    }
}
