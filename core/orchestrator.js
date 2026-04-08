// import { Memory } from "./memory.js";
// import { PlannerAgent } from "../agents/planner.js";
// import { ResearcherAgent } from "../agents/researcher.js";
// import { AnalystAgent } from "../agents/analyst.js";
// import { ReviewerAgent } from "../agents/reviewer.js";

// export class Orchestrator {
//     constructor() {
//         this.memory = new Memory();

//         this.agents = {
//             planner: new PlannerAgent(),
//             researcher: new ResearcherAgent(),
//             analyst: new AnalystAgent(),
//             reviewer: new ReviewerAgent(),
//         };
//     }

//     getAgent(name) {
//         return this.agents[name];
//     }

//     async run(task) {
//         console.log("\n🧠 Planning...\n");

//         const planRaw = await this.agents.planner.run(task, this.memory);

//         let plan;

//         try {
//             plan = JSON.parse(planRaw);
//         } catch (err) {
//             console.error("❌ Failed to parse plan:", planRaw);
//             return;
//         }

//         for (const step of plan.steps) {
//             const agent = this.getAgent(step.agent);

//             if (!agent) {
//                 console.log(`⚠️ Unknown agent: ${step.agent}`);
//                 continue;
//             }
//             console.log(`\n📌 Step: ${JSON.stringify(step, null, 2)}\n`);
//             console.log(`\n🤖 ${step.agent.toUpperCase()} running...`);

//             const result = await agent.run(step.task, this.memory);

//             this.memory.set(step.task, result);

//             console.log(`✅ Result:\n${result}\n`);
//         }console.log(`🧠 Updated Memory Keys:`, Object.keys(this.memory.getAll()));

//         console.log("\n🎯 Final Memory:\n", this.memory.getAll());
//     }
// }


import { Memory } from "./memory.js";
import { ControllerAgent } from "../agents/controller.js";
import { ResearcherAgent } from "../agents/researcher.js";
import { AnalystAgent } from "../agents/analyst.js";
import { ReviewerAgent } from "../agents/reviewer.js";
import { tools } from "./tools.js";

/**
 * Clean + Parse LLM Output
 */
function cleanAndParse(str) {
    try {
        if (!str || typeof str !== "string") return null;

        // Remove markdown
        let cleaned = str.replace(/```json/gi, "").replace(/```/g, "");

        // Extract JSON boundaries
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start === -1 || end === -1) return null;

        cleaned = cleaned.substring(start, end + 1);

        return JSON.parse(cleaned);
    } catch (err) {
        console.log("❌ JSON Parse Error:", err.message);
        return null;
    }
}

class Orchestrator {
    constructor() {
        this.memory = new Memory();

        this.controller = new ControllerAgent();

        this.agents = {
            researcher: new ResearcherAgent(),
            analyst: new AnalystAgent(),
            reviewer: new ReviewerAgent(),
        };
    }

    async run(task, onStep = null) {
        this.memory.set("user_task", task);

        for (let i = 0; i < 6; i++) {
            console.log(`\n🔁 Iteration ${i + 1}`);

            const decisionRaw = await this.controller.run(
                "Decide next step",
                this.memory
            );

            console.log("🧾 RAW OUTPUT:\n", decisionRaw);

            let decision = cleanAndParse(decisionRaw);

            console.log("🧠 PARSED DECISION:", decision);

            // Validate decision - MUST have action property
            if (!decision || typeof decision !== "object" || !decision.action) {
                console.log("❌ Invalid decision format, retrying...");
                continue;
            }

            // ✅ FINISH
            if (decision.action === "finish") {
                console.log("✅ Task completed");
                break;
            }

            // ✅ DELEGATE
            if (decision.action === "delegate") {
                const agent = this.agents[decision.agent];

                if (!agent) {
                    console.log("❌ Unknown agent:", decision.agent);
                    continue;
                }

                console.log(`🤖 Delegating to ${decision.agent}`);

                const result = await agent.run(decision.task, this.memory);

                this.memory.set(`step_${i}`, result);

                // Emit step data if callback provided
                if (onStep && typeof onStep === "function") {
                    onStep({
                        agent: decision.agent,
                        task: decision.task,
                        result: result,
                    });
                }
            }

            // ✅ TOOL
            if (decision.action === "tool") {
                console.log(`🛠 Using tool: ${decision.tool} with input: ${decision.input}`);
                const toolFn = tools[decision.tool];

                if (!toolFn) {
                    console.log("❌ Unknown tool:", decision.tool);
                    continue;
                }

                console.log(`🛠 Using tool: ${decision.tool}`);

                const result = await toolFn(decision.input);

                console.log(`🛠 Tool Result: ${result}`);

                this.memory.set(`tool_${i}`, result);

                // Emit step data if callback provided
                if (onStep && typeof onStep === "function") {
                    onStep({
                        agent: "tool",
                        task: decision.tool,
                        result: result,
                    });
                }
            }

            // 🔍 Debug Memory State
            console.log("🧠 Memory Keys:", Object.keys(this.memory.getAll()));
        }

        console.log("\n🎯 Final Memory:\n", this.memory.getAll());
    }
}

export { Orchestrator };