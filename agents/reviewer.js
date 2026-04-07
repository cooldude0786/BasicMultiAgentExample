const { BaseAgent } = require("./coreAggent.js");

class ReviewerAgent extends BaseAgent {
    constructor() {
        super(
            "Reviewer",
            `
You are a reviewer agent.

Your job:
- Take analysis
- Provide final decision/recommendation

You must:
- Give clear conclusion
- Justify reasoning
`
        );
    }
}

module.exports = { ReviewerAgent };