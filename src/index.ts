import fs from "fs";
import CNFChromosome from "./examples/CNFSat/CNFChromosome";
import CNFExpresion from "./examples/CNFSat/CNFExpression";
import CNFSatProblem from "./examples/CNFSat/CNFSatProblem";
import GABuilder from "./gaBuilder";
import ChromosomeCombiners from "./helpers/chromosomeCombiners";
import ChromosomeMutators from "./helpers/chromosomeMutators";
import FRBTPopulation from "./helpers/frbtPopulation";

// TODO: command line args
const INITIAL_POPULATION_SIZE = 1000000; // TODO: function of number of clauses / variable count
const MAX_EPOCH = 1500;
const ELITISM = 2500;
const SELECTION_SIZE = 5000;
const MAX_GENES_MUTATED = 3; // TODO: function of number of variables

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
        .withSelector({
            select: (context) => {
                return context.population.getNFittest(SELECTION_SIZE);
            },
        })
        // Traditional Mutation
        .withOperator({
            operate: (context) => {
                return ChromosomeMutators.applyGeneMutator<CNFChromosome, boolean>(
                    context.selection,
                    (a) => !a,
                    () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1, // TODO: use percentage of # of variables
                );
            },
        })
        // Mutation targeting variables from unsatisfied clauses
        .withOperator({
            operate: (context) => {
                return ChromosomeMutators.applyGeneMutator<CNFChromosome, boolean>(
                    context.selection,
                    (a) => !a,
                    () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1, // TODO: use percentage of # of variables
                    (chromosome) => {
                        const clauses = context.problem.expression.getUnsatisfiedClauses(chromosome.toArray());
                        const variableIndices: Set<number> = new Set();
                        clauses.forEach((c) => {
                            c.getVariables().forEach((v) => variableIndices.add(v.index));
                        });
                        return Array.from(variableIndices);
                    },
                );
            },
        })
        // Swap Mutation
        .withOperator({
            operate: (context) => {
                return ChromosomeMutators.swapGenes<CNFChromosome, boolean>(
                    context.selection,
                    () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1,
                );
            },
        })
        // Swap mutation targeting variables from unsatisfied clauses
        .withOperator({
            operate: (context) => {
                return ChromosomeMutators.swapGenes<CNFChromosome, boolean>(
                    context.selection,
                    () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1,
                    (chromosome) => {
                        const clauses = context.problem.expression.getUnsatisfiedClauses(chromosome.toArray());
                        const variables: Set<number> = new Set();
                        clauses.forEach((c) => {
                            c.getVariables().forEach((v) => variables.add(v.index));
                        });
                        return Array.from(variables);
                    },
                );
            },
        })
        // Alternating Crossover
        .withOperator({
            operate: (context) => {
                const generatedChromosomes: CNFChromosome[] = [];
                for (const c1 of context.selection) {
                    const c2 = context.selection[Math.floor(Math.random() * context.selection.length)];
                    const [m1, m2] = ChromosomeCombiners.alternate(c1, c2);
                    generatedChromosomes.push(m1);
                    generatedChromosomes.push(m2);
                }
                return generatedChromosomes;
            },
        })
        // Random Alternating Crossover
        .withOperator({
            operate: (context) => {
                const generatedChromosomes: CNFChromosome[] = [];
                for (const c1 of context.selection) {
                    const c2 = context.getRandomSelection();
                    const [m1, m2] = ChromosomeCombiners.randomAlternate(c1, c2, Math.random());
                    generatedChromosomes.push(m1);
                    generatedChromosomes.push(m2);
                }
                return generatedChromosomes;
            },
        })
        // Traditional Crossover
        .withOperator({
            operate: (context) => {
                const generatedChromosomes: CNFChromosome[] = [];
                for (const c1 of context.selection) {
                    const c2 = context.getRandomSelection();
                    const [m1, m2] = ChromosomeCombiners.crossover(c1, c2, Math.random());
                    generatedChromosomes.push(m1);
                    generatedChromosomes.push(m2);
                }
                return generatedChromosomes;
            },
        })
        .withFinishCondition((context) => {
            return context.fittest?.getFitness() === context.problem.expression.getClauseCount() // satisfied
                || context.population.getEpoch() >= MAX_EPOCH; // max number of generations
        })
        .build();

    const { fittest } = ga.run();

    if (fittest) {
        console.log(`Final best fitness: ${fittest.getFitness()}`);
        console.log(fittest.toString());
        console.log(fittest.serialize());
    } else {
        console.log(`No solution found`);
    }
};

main();
