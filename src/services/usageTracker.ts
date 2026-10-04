import fs from 'fs/promises';
import path from 'path';

const USAGE_FILE = path.join(process.cwd(), '.ai_usage.json');

interface UsageRecord {
  timestamp: number;
  apiKey: string;
}

export async function logUsage(apiKey: string) {
  try {
    let usage: UsageRecord[] = [];
    try {
      const content = await fs.readFile(USAGE_FILE, 'utf8');
      usage = JSON.parse(content);
    } catch (e) {
      // file might not exist
    }

    usage.push({
      timestamp: Date.now(),
      apiKey
    });

    await fs.writeFile(USAGE_FILE, JSON.stringify(usage, null, 2), 'utf8');
  } catch (error) {
    console.error("Failed to log AI usage:", error);
  }
}

export async function getUsageStats(apiKey: string) {
  try {
    const content = await fs.readFile(USAGE_FILE, 'utf8');
    const usage: UsageRecord[] = JSON.parse(content);
    
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const week = 7 * day;
    const month = 30 * day;

    const keyUsage = usage.filter(u => u.apiKey === apiKey);

    return {
      daily: keyUsage.filter(u => now - u.timestamp < day).length,
      weekly: keyUsage.filter(u => now - u.timestamp < week).length,
      monthly: keyUsage.filter(u => now - u.timestamp < month).length,
    };
  } catch (e) {
    // Return 0 if file doesn't exist
    return { daily: 0, weekly: 0, monthly: 0 };
  }
}
