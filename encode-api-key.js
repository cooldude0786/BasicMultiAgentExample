// Run this script to encode your apiKey.json for Vercel
// Usage: node encode-api-key.js

import fs from 'fs';
import path from 'path';

const keyPath = path.join(process.cwd(), 'apiKey.json');

if (!fs.existsSync(keyPath)) {
  console.error('❌ apiKey.json not found in the current directory');
  process.exit(1);
}

try {
  const keyContent = fs.readFileSync(keyPath, 'utf-8');
  const encoded = Buffer.from(keyContent).toString('base64');
  
  console.log('✅ Copy the value below and add it to Vercel as environment variable VERTEX_API_KEY:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(encoded);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Steps to deploy to Vercel:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings > Environment Variables');
  console.log('4. Add a new variable:');
  console.log('   Name: VERTEX_API_KEY');
  console.log('   Value: (paste the encoded value above)');
  console.log('5. Click "Add" and redeploy\n');
  
} catch (err) {
  console.error('❌ Error reading apiKey.json:', err.message);
  process.exit(1);
}
