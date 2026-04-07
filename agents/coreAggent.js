const { callClaude } = require("../core/llm.js");

class BaseAgent {
    constructor(name, systemPrompt) {
        this.name = name;
        this.systemPrompt = systemPrompt;
    }

    async run(input, memory) {
        const context = JSON.stringify(memory.getAll(), null, 2);

        console.log(`\n============================`);
        console.log(`🤖 Agent: ${this.name}`);
        console.log(`📥 Input: ${input}`);
        console.log(`🧠 Memory: ${context}`);
        console.log(`============================\n`);

        const response = await callClaude(this.systemPrompt, `
Context:
${context}

Task:
${input}
`);

        console.log(`📤 Output from ${this.name}:\n${response}\n`);

        return response;
    }
}

module.exports = { BaseAgent };