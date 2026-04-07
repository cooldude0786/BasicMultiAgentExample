
const Anthropic = require("@anthropic-ai/sdk").default;
const dotenv = require("dotenv");

dotenv.config();

const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

async function callClaude(system, user) {
    const response = await client.messages.create({
        model: "claude-opus-4-20250514", // 💰 cheapest
        max_tokens: 800,
        temperature: 0.7,
        system,
        messages: [
            {
                role: "user",
                content: user,
            },
        ],
    });

    return response.content[0].text;
}

module.exports = { callClaude };