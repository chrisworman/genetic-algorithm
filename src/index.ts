import fs from "fs";
import CNFChromosome from "./examples/CNF/CNFChromosome";
import CNFExpresion from "./examples/CNF/CNFExpression";
import CNFSatProblem from "./examples/CNF/CNFSatProblem";
import GABuilder from "./gaBuilder";
import ChromosomeCombiners from "./helpers/chromosomeCombiners";
import ChromosomeMutators from "./helpers/chromosomeMutators";
import FRBTPopulation from "./helpers/frbtPopulation";

// TODO: command line args
const INITIAL_POPULATION_SIZE = 500000; // TODO: function of number of clauses / variable count
const MAX_EPOCH = 1500;
const ELITISM = 3000;
const SELECTION_SIZE = 5000;
const MAX_GENES_MUTATED = 8; // TODO: function of number of variables

const main = () => {
    const [ , , flag, fileName ] = process.argv;
    if (flag !== "-f") {
        console.error(`Invalid option ${flag}.  Try -f filename.cnf`);
        return;
    }
    if (!fileName || !fileName.endsWith(".cnf")) {
        console.error(`Invalid file name ${fileName}: must be .cnf file`);
        return;
    }

    // Read CNF file and create CNF SAT instance
    const cnfFileText = fs.readFileSync(fileName, "utf8");
    const problem: CNFSatProblem = new CNFSatProblem(CNFExpresion.fromCNFFileText(cnfFileText));

    console.log(`Creating initial population of ${INITIAL_POPULATION_SIZE} chromosomes`);
    const initialChromosomes: CNFChromosome[] = [];
    const variableCount = problem.expression.getVariableCount();
    for (let i = 0; i < INITIAL_POPULATION_SIZE; i++) {
        const truthAssignments: boolean[] = [];
        for (let j = 0; j < variableCount; j++) {
            truthAssignments[j] = Math.random() < 0.5;
        }
        const randomChromosome = new CNFChromosome(truthAssignments);
        randomChromosome.setFitness(problem.getFitness(randomChromosome));
        initialChromosomes.push(randomChromosome);
    }
    const initialPopulation: FRBTPopulation<CNFChromosome, boolean> = new FRBTPopulation(initialChromosomes);

    const gaBuilder: GABuilder<CNFSatProblem, CNFChromosome, boolean> = new GABuilder();
    const ga = gaBuilder
        .withProblem(problem)
        .withInitialPopulation(initialPopulation)
        .withElitism(ELITISM)
        .withSelection({
            select: (context) => {
                return context.population.getNFittest(SELECTION_SIZE);
            },
        })
        // Traditional Mutation
        .withOperator({
            operate: (context, selection) => {
                const mutatedChromosomes: CNFChromosome[] = [];
                for (const chromosome of selection) {
                    const mutatedChromosome = ChromosomeMutators.applyGeneMutator<CNFChromosome, boolean>
                    (
                        chromosome,
                        Math.floor(Math.random() * MAX_GENES_MUTATED) + 1, // TODO: use percentage of # of variables
                        (a) => !a,
                    );
                    mutatedChromosomes.push(mutatedChromosome);
                }
                return mutatedChromosomes;
            },
        })
        // Swap Mutation
        .withOperator({
            operate: (context, selection) => {
                const mutatedChromosomes: CNFChromosome[] = [];
                for (const chromosome of selection) {
                    const mutatedChromosome = ChromosomeMutators.swapGenes<CNFChromosome, boolean>
                    (
                        chromosome,
                        Math.floor(Math.random() * MAX_GENES_MUTATED) + 1, // TODO: use percentage of # of variables
                    );
                    mutatedChromosomes.push(mutatedChromosome);
                }
                return mutatedChromosomes;
            },
        })
        // Alternating Crossover
        .withOperator({
            operate: (context, selection) => {
                const generatedChromosomes: CNFChromosome[] = [];
                for (const c1 of selection) {
                    const c2 = selection[Math.floor(Math.random() * selection.length)];
                    const [m1, m2] = ChromosomeCombiners.alternateGenes(c1, c2);
                    generatedChromosomes.push(m1);
                    generatedChromosomes.push(m2);
                }
                return generatedChromosomes;
            },
        })
        // Traditional Crossover
        .withOperator({
            operate: (context, selection) => {
                const generatedChromosomes: CNFChromosome[] = [];
                for (const c1 of selection) {
                    const c2 = selection[Math.floor(Math.random() * selection.length)];
                    const [m1, m2] = ChromosomeCombiners.crossover(c1, c2);
                    generatedChromosomes.push(m1);
                    generatedChromosomes.push(m2);
                }
                return generatedChromosomes;
            },
        })
        .withFinishCondition((context) => {
            return context.best?.fitness === context.problem.expression.getClauseCount() // satisfied
                || context.population.getEpoch() >= MAX_EPOCH; // max number of generations
        })
        .build();

    const result = ga.run();
    console.log(`Final best fitness: ${result.best?.fitness}`);
    const bestChromosome = result.best?.chromosome;
    if (bestChromosome) {
        const buffer: string[] = [];
        const geneCount = bestChromosome.getGeneCount();
        for (let i = 0; i < geneCount; i++) {
            const gene = bestChromosome.getGeneAt(i);
            buffer.push(gene ? "0" : "1");
        }
        console.log(buffer.join(""));
    }
};

main();
