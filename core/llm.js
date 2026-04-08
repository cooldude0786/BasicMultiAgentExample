import { VertexAI } from '@google-cloud/vertexai';
import path from 'path';
import fs from 'fs';
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

dotenv.config();

let projectId;

if (process.env.VERTEX_API_KEY) {
  // Production: Read from environment variable (base64 encoded JSON)
  try {
    const decoded = Buffer.from(process.env.VERTEX_API_KEY, 'base64').toString('utf-8');
    const keyData = JSON.parse(decoded);
    projectId = keyData.project_id;
    process.env.GOOGLE_APPLICATION_CREDENTIALS = JSON.stringify(keyData);
  } catch (err) {
    console.error('Failed to decode VERTEX_API_KEY:', err.message);
    throw new Error('Invalid VERTEX_API_KEY environment variable');
  }
} else {
  // Development: Read from local file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const keyPath = path.join(__dirname, '..', 'apiKey.json');
  
  if (!fs.existsSync(keyPath)) {
    throw new Error(`API key file not found at ${keyPath} and VERTEX_API_KEY environment variable not set`);
  }
  
  const keyFile = fs.readFileSync(keyPath, 'utf8');
  const keyData = JSON.parse(keyFile);
  projectId = keyData.project_id;
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
}

const vertexAI = new VertexAI({ project: projectId, location: 'us-central1' });

async function callGemini(system, user) {
    const model = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: system + '\n' + user }] }],
    });
    return result.response.candidates[0].content.parts[0].text;
}


export { callGemini };