# genetic-algorithm

Generic Genetic Algorithm (GA) runner with examples.  Provides a basic API to define and run GA's.  A new GA instance
is created using a builder and is initiated using the `run` method:

```typescript
const SELECTION_SIZE = 100;
const MAX_GENES_MUTATED = 3;
const gaBuilder: GABuilder<MyProblem, BooleanChromosome, boolean> = new GABuilder();
const ga = gaBuilder
    .withProblem(myProblem)
    .withInitialPopulation(initialPopulation)
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
                () => Math.floor(Math.random() * MAX_GENES_MUTATED) + 1,
            );
        },
    })
    .build();

const { fittest } = ga.run();
```

# Examples

To run the examples, start by installing the dependencies:

```bash
yarn install
```

## Conjunctive Normal Form Boolean Satisfiability

A GA implementation of the [Boolean Satisfiability problem](https://en.wikipedia.org/wiki/Boolean_satisfiability_problem) 
for expressions in Conjunctive Normal Form (CNF).

```bash
yarn cnfsat -f ./src/examples/CNFSat/CNFTestFiles/satisfiable-1.cnf   
```

## Maximum Independent Set

A GA implementation of the [Maximum Indepedent Set (MIS) problem](https://en.wikipedia.org/wiki/Maximal_independent_set)
for graphs.

```bash
yarn mis -f ./src/examples/MIS/MISTestFiles/frb30-15-1.mis
```
