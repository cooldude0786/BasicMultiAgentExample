import { BaseAgent } from "./coreAggent.js";

class ResearcherAgent extends BaseAgent {
    constructor() {
        super(
            "Researcher",
            `
You are a researcher agent.

Your job:
- ONLY gather factual information
- DO NOT analyze
- DO NOT give recommendations

Output should be:
- Raw data
- Facts
- Metrics

Do NOT conclude anything.
`
        );
    }
}

export { ResearcherAgent };