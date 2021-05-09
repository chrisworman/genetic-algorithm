import { GABuilder } from "../../core";
import { BooleanChromosome } from "../../core";
import { ChromosomeCombiners } from "../../core";
import { ChromosomeMutators } from "../../core";
import { FRBTPopulation } from "../../core";
import { MISFileReader } from "./MISFileReader";
import { MISProblem } from "./MISProblem";

// TODO: command line args
const INITIAL_POPULATION_SIZE = 1000000; // TODO: function of number of clauses / variable count
const MAX_EPOCH = 2500;
const ELITISM = 1000;
const SELECTION_SIZE = 10000;
const MAX_GENES_MUTATED = 5; // TODO: function of number of variables

const cnfSat = () => {
    const [ , , flag, filePath ] = process.argv;
    if (flag !== "-f") {
        console.error(`Invalid option ${flag}.  Try -f filename.mis`);
        return;
    }
    if (!filePath || !filePath.endsWith(".mis")) {
        console.error(`Invalid file name ${filePath}: must be .mis file`);
        return;
    }

    console.log("Creating MISProblem ...");
    const problem: MISProblem = MISFileReader.read(filePath);

    // Create the initial population
    console.log(`Creating initial population of ${INITIAL_POPULATION_SIZE} chromosomes ...`);
    const vertexCount = problem.getVertexCount();
    const initialChromosomes: BooleanChromosome[] = new Array(INITIAL_POPULATION_SIZE);
    for (let i = 0; i < INITIAL_POPULATION_SIZE; i++) {
        const randomChromosome = BooleanChromosome.createRandom(vertexCount, 0.01);
        randomChromosome.setFitness(problem.getFitness(randomChromosome));
        initialChromosomes[i] = randomChromosome;
    }
    const initialPopulation: FRBTPopulation<BooleanChromosome> = new FRBTPopulation(initialChromosomes);

    // Build the genetic algorithm
    const gaBuilder: GABuilder<MISProblem, BooleanChromosome, boolean> = new GABuilder();
    const ga = gaBuilder
        .withProblem(problem)
        .withInitialPopulation(initialPopulation)
        .withElitism(() => ELITISM)
        .withSelector({
            select: (context) => {
                return context.population.getNFittest(
                   // Math.max(Math.ceil(SELECTION_SIZE / (context.population.getEpoch())), 50),
                   SELECTION_SIZE - (context.population.getEpoch() * 4),
                );
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
            getDescription: () => "Swap Mutation",
            operate: (context) => {
                return ChromosomeMutators.swapGenes<BooleanChromosome, boolean>(
                    context.selection,
                    () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1,
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
            return context.fittest?.getFitness() === 30 // TODO: read from mis file
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
