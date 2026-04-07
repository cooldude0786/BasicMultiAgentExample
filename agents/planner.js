const { BaseAgent } = require("./coreAggent.js");

class PlannerAgent extends BaseAgent {
  constructor() {
    super(
      "Planner",
      `
You are a planning agent.

Your job:
- Break a task into steps
- Decide which agent should handle each step

Available agents:
- researcher
- analyst
- reviewer

Return STRICT JSON:

{
  "steps": [
    { "agent": "researcher", "task": "..." },
    { "agent": "analyst", "task": "..." }
  ]
}
`
    );
  }
}

module.exports = { PlannerAgent };