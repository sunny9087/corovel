/**
 * Seed/update tasks in the database
 * Run with: npx tsx scripts/seed-tasks.ts
 * 
 * This script will:
 * - Add new tasks from DEFAULT_TASKS
 * - Update existing tasks with new points/settings
 * - Deactivate old tasks no longer in the default list
 */
import "dotenv/config";
import { initializeTasks } from "../lib/tasks.js";

async function main() {
  console.log("🔄 Updating task definitions...");
  console.log("");
  
  await initializeTasks();
  
  console.log("✅ Tasks updated successfully!");
  console.log("");
  console.log("Task categories:");
  console.log("  • Focus & Direction - Setting intentions and priorities");
  console.log("  • Learning & Skill - Knowledge and skill building");
  console.log("  • Output & Creation - Shipping tangible work");
  console.log("  • Reflection & Review - Processing progress");
  console.log("  • Health & Energy - Physical foundation");
  console.log("  • System - Platform bonuses");
  console.log("");
  
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error updating tasks:", error);
  process.exit(1);
});
