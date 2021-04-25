import CNFExpresion from "./examples/CNF/CNFExpression";
import CNFGene from "./examples/CNF/CNFGene";
import CNFSatProblem from "./examples/CNF/CNFSatProblem";
import GABuilder from "./gaBuilder";
import GeneCombinators from "./helpers/geneCombiners";
import GeneMutators from "./helpers/geneMutators";
import GeneSelectors from "./helpers/geneSelectors";

const TEST_CNF_FILE_TEXT =
`
c FILE: aim-50-1_6-yes1-4.cnf
c
c SOURCE: Kazuo Iwama, Eiji Miyano (miyano@cscu.kyushu-u.ac.jp),
c          and Yuichi Asahiro
c
c DESCRIPTION: Artifical instances from generator by source.  Generators
c              and more information in sat/contributed/iwama.
c
c NOTE: Satisfiable
c
p cnf 50 80
16 17 30 0
-17 22 30 0
-17 -22 30 0
16 -30 47 0
16 -30 -47 0
-16 -21 31 0
-16 -21 -31 0
-16 21 -28 0
-13 21 28 0
13 -16 18 0
13 -18 -38 0
13 -18 -31 0
31 38 44 0
-8 31 -44 0
8 -12 -44 0
8 12 -27 0
12 27 40 0
-4 27 -40 0
12 23 -40 0
-3 4 -23 0
3 -23 -49 0
3 -13 -49 0
-23 -26 49 0
12 -34 49 0
-12 26 -34 0
19 34 36 0
-19 26 36 0
-30 34 -36 0
24 34 -36 0
-24 -36 43 0
6 42 -43 0
-24 42 -43 0
-5 -24 -42 0
5 20 -42 0
5 -7 -20 0
4 7 10 0
-4 10 -20 0
7 -10 -41 0
-10 41 46 0
-33 41 -46 0
33 -37 -46 0
32 33 37 0
6 -32 37 0
-6 25 -32 0
-6 -25 -48 0
-9 28 48 0
-9 -25 -28 0
19 -25 48 0
2 9 -19 0
-2 -19 35 0
-2 22 -35 0
-22 -35 50 0
-17 -35 -50 0
-29 -35 -50 0
-1 29 -50 0
1 11 29 0
-11 17 -45 0
-11 39 45 0
-26 39 45 0
-3 -26 45 0
-11 15 -39 0
14 -15 -39 0
14 -15 -45 0
14 -15 -27 0
-14 -15 47 0
17 17 40 0
1 -29 -31 0
-7 32 38 0
-14 -33 -47 0
-1 2 -8 0
35 43 44 0
21 21 24 0
20 29 -48 0
23 35 -37 0
2 18 -33 0
15 25 -45 0
9 14 -38 0
-5 11 50 0
-3 -13 46 0
-13 -41 43 0
`;

const main = () => {
    const numberOfGenerations = 100;
    const gaBuilder: GABuilder<CNFSatProblem, CNFGene> = new GABuilder();
    const ga = gaBuilder
        .withProblem(new CNFSatProblem(CNFExpresion.fromCNFFileText(TEST_CNF_FILE_TEXT)))
        // Random genes
        .withGeneGenerator({
            generate: (context) => {
                const numberToGenerate = 120 - context.currentGeneration.number;
                const generatedGenes: CNFGene[] = [];
                const variableCount = context.problem.expression.getVariableCount();
                for (let i = 0; i < numberToGenerate; i++) {
                    const truthAssignments: boolean[] = [];
                    for (let j = 1; j <= variableCount; j++) {
                        truthAssignments[j] = Math.random() < 0.5;
                    }
                    generatedGenes.push(new CNFGene(truthAssignments));
                }
                return generatedGenes;
            },
        })
        // Mutation
        .withGeneGenerator({
            generate: (context) => {
                const generatedGenes: CNFGene[] = [];
                for (let i = 0; i < 25; i++) {
                    const [randomGene] = GeneSelectors.randomUnique(context.currentGeneration.genePool);
                    const mutatedTruthAssignments = GeneMutators.mutateN(
                        randomGene.getTruthAssignments(),
                        2,
                        (a) => {
                            if (a === undefined) {
                                return a;
                            }
                            return !a;
                        },
                    );
                    generatedGenes.push(new CNFGene(mutatedTruthAssignments));
                }
                return generatedGenes;
            },
        })
        // Crossover
        .withGeneGenerator({
            generate: (context) => {
                const generatedGenes: CNFGene[] = [];
                for (let i = 0; i < 10; i++) {
                    const [g1, g2] =  GeneSelectors.randomUnique(context.currentGeneration.genePool, 2);
                    const crossedTruthAssignments = GeneCombinators.crossoverAlternating(
                        g1.getTruthAssignments(),
                        g2.getTruthAssignments(),
                    );
                    generatedGenes.push(new CNFGene(crossedTruthAssignments));
                }
                return generatedGenes;
            },
        })
        // Remove unfit genes
        .withGeneFilter({
            filter: (context) => {
                return context.currentGeneration.genePool.filter((gene) => {
                    // Less than 50% of clauses satisfied
                    return context.getFitness(gene) >= context.problem.expression.getClauseCount() * 0.5;
                });
            },
        })
        .withFinishCondition((context) => {
            return context.best?.fitness === context.problem.expression.getClauseCount() // satisfied
                || context.currentGeneration.number >= numberOfGenerations; // max number of generations
        })
        .build();

    const result = ga.run();

    console.log(JSON.stringify(result.best, null, 2));
};

main();
