import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../../.env");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

import { db, expensesTable, projectsTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";

async function run() {
  try {
    // Get the first user id
    const [project] = await db.select().from(projectsTable).limit(1);
    if (!project) {
      console.log("No projects found in DB!");
      return;
    }
    const userId = project.userId;
    console.log("Testing with userId:", userId);

    const rows = await db.execute(sql`
      SELECT
        TO_CHAR(e.date::date, 'Mon YY')  AS month,
        TO_CHAR(e.date::date, 'YYYY-MM') AS month_key,
        e.category,
        ROUND(SUM(e.amount)::numeric, 2) AS total
      FROM expenses e
      JOIN projects p ON e.project_id = p.id
      WHERE p.user_id = ${userId}
        AND e.date::date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY month_key, month, e.category
      ORDER BY month_key
    `);
    
    console.log("Trend rows:", rows.rows);

    const [agg] = await db
      .select({
        totalExpenses: sql<number>`COUNT(*)::int`,
        avgExpense: sql<number>`COALESCE(ROUND(AVG(${expensesTable.amount})::numeric, 2), 0)`,
        largestExpense: sql<number>`COALESCE(MAX(${expensesTable.amount}), 0)`,
        uniqueVendors: sql<number>`COUNT(DISTINCT ${expensesTable.vendor})::int`,
      })
      .from(expensesTable)
      .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
      .where(eq(projectsTable.userId, userId));
      
    console.log("Agg:", agg);
  } catch (err) {
    console.error("Error running query:", err);
  } finally {
    process.exit(0);
  }
}

run();
