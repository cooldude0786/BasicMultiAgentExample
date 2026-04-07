const { BaseAgent } = require("./coreAggent.js");

class AnalystAgent extends BaseAgent {
    constructor() {
        super(
            "Analyst",
            `
You are an analyst agent.

Your job:
- Analyze given data
- Identify patterns, risks, insights

DO NOT:
- Gather new data
- Give final recommendation
`

        );
    }
}

module.exports = { AnalystAgent };
