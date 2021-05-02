import fs from "fs";
import CNFChromosome from "./examples/CNFSat/CNFChromosome";
import CNFExpresion from "./examples/CNFSat/CNFExpression";
import CNFSatProblem from "./examples/CNFSat/CNFSatProblem";
import GABuilder from "./gaBuilder";
import ChromosomeCombiners from "./helpers/chromosomeCombiners";
import ChromosomeMutators from "./helpers/chromosomeMutators";
import FRBTPopulation from "./helpers/frbtPopulation";

// TODO: command line args
const INITIAL_POPULATION_SIZE = 500000; // TODO: function of number of clauses / variable count
const MAX_EPOCH = 1500;
const ELITISM = 3500;
const SELECTION_SIZE = 5000;
const MAX_GENES_MUTATED = 5; // TODO: function of number of variables

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
        .withElitism((context) => ELITISM)
        .withSelector({
            select: (context) => {
                return context.population.getNFittest(SELECTION_SIZE);
            },
        })
        .withOperator({
            getDescription: () => "Mutation",
            operate: (context) => {
                return ChromosomeMutators.applyGeneMutator<CNFChromosome, boolean>(
                    context.selection,
                    (a) => !a,
                    () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1, // TODO: use percentage of # of variables
                );
            },
        })
        .withOperator({
            getDescription: () => "Mutation targeting variables from unsatisfied clauses",
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
        .withOperator({
            getDescription: () => "Swap Mutation",
            operate: (context) => {
                return ChromosomeMutators.swapGenes<CNFChromosome, boolean>(
                    context.selection,
                    () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1,
                );
            },
        })
        .withOperator({
            getDescription: () => "Swap mutation targeting variables from unsatisfied clauses",
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
        .withOperator({
            getDescription: () => "Variable single point crossover",
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
        .withOperator({
            getDescription: () => "Alternating Crossover",
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
        .withOperator({
            getDescription: () => "Random Alternating Crossover",
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
        // TODO: patch crossover
        .on("selected", (context) => {
            const { fittest: f, population } = context;
            console.log(`#${population.getEpoch()} size ${population.getSize()} fittest ${f && f.getFitness()}`);
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
