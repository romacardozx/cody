package ar.edu.unsam.cody.model;

/** Category an algorithm belongs to, and the kind of scenario it runs on. */
public enum AlgorithmFamily {
    SORTING(ScenarioType.ARRAY),
    SEARCHING(ScenarioType.ARRAY),
    GRAPH(ScenarioType.GRAPH),
    /** Stacks, lists, hash tables, trees: built by inserting the values of an array, one by one. */
    DATA_STRUCTURE(ScenarioType.ARRAY),
    /** Ideas behind every algorithm (Big O, recursion, two pointers...); techniques run on an array. */
    CONCEPT(ScenarioType.ARRAY);

    private final ScenarioType scenarioType;

    AlgorithmFamily(ScenarioType scenarioType) {
        this.scenarioType = scenarioType;
    }

    public ScenarioType scenarioType() {
        return scenarioType;
    }
}
