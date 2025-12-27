/**
 * Seed default tasks into the database
 * Run with: npx tsx scripts/seed-tasks.ts
 */
import { initializeTasks } from "../lib/tasks.js";

async function main() {
  console.log("Seeding tasks...");
  await initializeTasks();
  console.log("Tasks seeded successfully!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Error seeding tasks:", error);
  process.exit(1);
});
