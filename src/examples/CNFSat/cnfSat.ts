import fs from "fs";
import { GABuilder } from "../../core";
import { BooleanChromosome } from "../../core";
import { ChromosomeCombiners } from "../../core";
import { ChromosomeMutators } from "../../core";
import { FRBTPopulation } from "../../core";
import { CNFExpression } from "./CNFExpression";
import { CNFSatProblem } from "./CNFSatProblem";

// TODO: command line args
const INITIAL_POPULATION_SIZE = 500000; // TODO: function of number of clauses / variable count
const MAX_EPOCH = 1500;
const ELITISM = 5000;
const SELECTION_SIZE = 10000;
const MAX_GENES_MUTATED = 10; // TODO: function of number of variables

const cnfSat = () => {
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
    console.log("Creating CNFSatProblem ...");
    const cnfFileText = fs.readFileSync(fileName, "utf8");
    const problem: CNFSatProblem = new CNFSatProblem(CNFExpression.fromCNFFileText(cnfFileText));
    console.log(`  ${problem.expression.getClauseCount()} clauses ${problem.expression.getVariableCount()} variables`);

    // Create the initial population
    console.log(`Creating initial population of ${INITIAL_POPULATION_SIZE} chromosomes ...`);
    const variableCount = problem.expression.getVariableCount();
    const initialChromosomes: BooleanChromosome[] = new Array(INITIAL_POPULATION_SIZE);
    for (let i = 0; i < INITIAL_POPULATION_SIZE; i++) {
        const randomChromosome = BooleanChromosome.createRandom(variableCount);
        randomChromosome.setFitness(problem.getFitness(randomChromosome));
        initialChromosomes[i] = randomChromosome;
    }
    const initialPopulation: FRBTPopulation<BooleanChromosome> = new FRBTPopulation(initialChromosomes);

    // Build the genetic algorithm
    const gaBuilder: GABuilder<CNFSatProblem, BooleanChromosome, boolean> = new GABuilder();
    const ga = gaBuilder
        .withProblem(problem)
        .withInitialPopulation(initialPopulation)
        .withElitism(() => ELITISM)
        .withSelector({
            select: (context) => {
                return context.population.getNFittest(SELECTION_SIZE);
            },
        })
        .withOperator({
            getDescription: () => "Mutation",
            operate: (context) => {
                return ChromosomeMutators.applyGeneMutator<BooleanChromosome, boolean>(
                    context.selection,
                    (a) => !a,
                    () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1, // TODO: use percentage of # of variables
                );
            },
        })
        .withOperator({
            getDescription: () => "Mutation targeting variables from unsatisfied clauses",
            operate: (context) => {
                return ChromosomeMutators.applyGeneMutator<BooleanChromosome, boolean>(
                    context.selection,
                    (a) => !a,
                    () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1, // TODO: use percentage of # of variables
                    (chromosome) => {
                        // Get the unsatisfied clauses for `chromosome`, target the variable indices from those clauses
                        return context.problem.expression.getUnsatisfiedClauses(chromosome.getGenes())
                            .map((c) => c.getVariables().map((v) => v.index))
                            .reduce((p, c) => p.concat(c));
                    },
                );
            },
        })
        .withOperator({
            getDescription: () => "Swap Mutation",
            operate: (context) => {
                return ChromosomeMutators.swapGenes<BooleanChromosome, boolean>(
                    context.selection,
                    () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1,
                );
            },
        })
        .withOperator({
            getDescription: () => "Swap mutation targeting variables from unsatisfied clauses",
            operate: (context) => {
                return ChromosomeMutators.swapGenes<BooleanChromosome, boolean>(
                    context.selection,
                    () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1,
                    (chromosome) => {
                        const clauses = context.problem.expression.getUnsatisfiedClauses(chromosome.getGenes());
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
                const generatedChromosomes: BooleanChromosome[] = new Array(context.selection.length * 2);
                let i = 0;
                for (const c1 of context.selection) {
                    const [m1, m2] = ChromosomeCombiners.crossover(c1, context.getRandomSelection(), Math.random());
                    generatedChromosomes[i++] = m1;
                    generatedChromosomes[i++] = m2;
                }
                return generatedChromosomes;
            },
        })
        .withOperator({
            getDescription: () => "Alternating Crossover",
            operate: (context) => {
                const generatedChromosomes: BooleanChromosome[] = new Array(context.selection.length * 2);
                let i = 0;
                for (const c1 of context.selection) {
                    const [m1, m2] = ChromosomeCombiners.alternate(c1, context.getRandomSelection());
                    generatedChromosomes[i++] = m1;
                    generatedChromosomes[i++] = m2;
                }
                return generatedChromosomes;
            },
        })
        .withOperator({
            getDescription: () => "Random Alternating Crossover",
            operate: (context) => {
                const generatedChromosomes: BooleanChromosome[] = new Array(context.selection.length * 2);
                let i = 0;
                for (const c1 of context.selection) {
                    const [m1, m2] = ChromosomeCombiners.randomAlternate(
                        c1,
                        context.getRandomSelection(),
                        Math.random(),
                    );
                    generatedChromosomes[i++] = m1;
                    generatedChromosomes[i++] = m2;
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

cnfSat();
