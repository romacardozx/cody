package ar.edu.unsam.cody.model;

/** Category an algorithm belongs to, and the kind of scenario it runs on. */
public enum AlgorithmFamily {
    SORTING(ScenarioType.ARRAY),
    SEARCHING(ScenarioType.ARRAY),
    GRAPH(ScenarioType.GRAPH);

    private final ScenarioType scenarioType;

    AlgorithmFamily(ScenarioType scenarioType) {
        this.scenarioType = scenarioType;
    }

    public ScenarioType scenarioType() {
        return scenarioType;
    }
}
