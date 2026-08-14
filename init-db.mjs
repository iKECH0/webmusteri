import { initDB } from './src/lib/db.js';

async function run() {
  console.log("Initializing DB...");
  try {
    await initDB();
    console.log("DB initialized successfully.");
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
run();
