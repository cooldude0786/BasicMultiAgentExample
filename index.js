import { Orchestrator } from "./core/orchestrator.js";

const orchestrator = new Orchestrator();

const task = "Analyze Tesla stock and suggest whether to invest";

orchestrator.run(task);