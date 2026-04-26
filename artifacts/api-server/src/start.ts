import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for .env in the root directory
const envPath = path.resolve(__dirname, "../../../.env");

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
  console.log("Successfully loaded environment variables from root .env");
} else {
  console.log("No .env file found at " + envPath);
}

// Dynamically import index.ts so that all static imports inside it 
// are evaluated AFTER process.env has been populated.
import("./index").catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
