"use server";

import fs from 'fs/promises';
import path from 'path';
import { getUsageStats } from '@/services/usageTracker';
export async function getApiKeysAndUsage() {
  const keysString = process.env.AI_PROVIDER_API_KEYS || process.env.AI_PROVIDER_API_KEY || "";
  const keys = keysString.split(",").map(k => k.trim()).filter(Boolean);
  
  const keysWithStats = await Promise.all(keys.map(async (key, index) => {
    const stats = await getUsageStats(key);
    return {
      id: index + 1,
      key: key,
      maskedKey: key.substring(0, 8) + "..." + key.substring(key.length - 4),
      limit: 20,
      stats
    };
  }));
  return keysWithStats;
}

export async function updateApiKeys(keys: string[]) {
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = "";
  try {
    envContent = await fs.readFile(envPath, 'utf8');
  } catch (e) {
    // file might not exist
  }

  const keysString = keys.join(',');
  let newContent = envContent;
  
  if (newContent.includes('AI_PROVIDER_API_KEYS=')) {
    newContent = newContent.replace(/AI_PROVIDER_API_KEYS=.*/g, `AI_PROVIDER_API_KEYS="${keysString}"`);
  } else {
    newContent += `\nAI_PROVIDER_API_KEYS="${keysString}"`;
  }
  
  if (keys.length > 0) {
    if (newContent.includes('AI_PROVIDER_API_KEY=')) {
      newContent = newContent.replace(/AI_PROVIDER_API_KEY=.*/g, `AI_PROVIDER_API_KEY="${keys[0]}"`);
    } else {
      newContent += `\nAI_PROVIDER_API_KEY="${keys[0]}"`;
    }
  }

  await fs.writeFile(envPath, newContent.trim() + '\n', 'utf8');
  
  // Update process.env for instant effect without restarting
  process.env.AI_PROVIDER_API_KEYS = keysString;
  if (keys.length > 0) {
    process.env.AI_PROVIDER_API_KEY = keys[0];
  }
  
  return true;
}
