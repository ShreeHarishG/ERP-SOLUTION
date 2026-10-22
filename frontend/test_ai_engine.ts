import fs from 'fs';
import path from 'path';

// Load .env manually
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn('Failed to load .env file manually:', e);
}

import { aiEngineService } from './lib/server/ai/ai-engine.service';
import prisma from './lib/server/db';

async function main() {
  try {
    console.log('--- Calling 1st time (cold, should fetch fresh context) ---');
    const insights1 = await aiEngineService.getInsights(false);
    
    console.log('\n--- Calling 2nd time (should hit cache) ---');
    const insights2 = await aiEngineService.getInsights(false);
    
    if (insights1 === insights2) {
      console.log('\n[SUCCESS] Both calls returned identical object references from cache.');
    } else {
      console.warn('\n[WARNING] Cache did not return identical object references.');
    }
  } catch (error) {
    console.error('Error running cache test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
