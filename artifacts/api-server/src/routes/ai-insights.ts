import { Router, type IRouter, type Request, type Response } from "express";
import { db, expensesTable, projectsTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.get("/ai-insights", async (req: Request, res: Response) => {
  try {
    const [categoryData, projectData, trendData, totalData] = await Promise.all([
      db.select({
        category: expensesTable.category,
        amount: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
        count: sql<string>`COUNT(*)`,
      }).from(expensesTable).groupBy(expensesTable.category).orderBy(desc(sql`SUM(${expensesTable.amount})`)),

      db.select({
        projectName: projectsTable.name,
        budget: projectsTable.budget,
        spent: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
      }).from(projectsTable)
        .leftJoin(expensesTable, sql`${expensesTable.projectId} = ${projectsTable.id}`)
        .groupBy(projectsTable.id, projectsTable.name, projectsTable.budget),

      db.select({
        month: sql<string>`TO_CHAR(DATE_TRUNC('month', date::timestamp), 'Mon YYYY')`,
        amount: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
      }).from(expensesTable)
        .where(sql`date::timestamp >= NOW() - INTERVAL '60 days'`)
        .groupBy(sql`DATE_TRUNC('month', date::timestamp)`)
        .orderBy(sql`DATE_TRUNC('month', date::timestamp)`),

      db.select({
        total: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
      }).from(expensesTable),
    ]);

    const totalSpent = parseFloat(totalData[0]?.total ?? "0");
    const overBudgetProjects = projectData.filter(p =>
      parseFloat(p.budget) > 0 && parseFloat(p.spent) > parseFloat(p.budget) * 0.8
    );

    const dataContext = `You are an AI cost advisor for a construction expense management system.
Analyze the following data and return 4–5 actionable insights. Be specific with numbers.

Total Spending: $${totalSpent.toFixed(2)}

Category Breakdown:
${categoryData.map(c => `- ${c.category}: $${parseFloat(c.amount).toFixed(2)} (${c.count} transactions)`).join("\n")}

Project Budget Status:
${projectData.map(p => {
  const budget = parseFloat(p.budget);
  const spent = parseFloat(p.spent);
  const pct = budget > 0 ? ((spent / budget) * 100).toFixed(0) : "N/A";
  return `- ${p.projectName}: Budget $${budget.toFixed(2)}, Spent $${spent.toFixed(2)} (${pct}%)`;
}).join("\n")}

Recent 60-day monthly trend:
${trendData.map(t => `- ${t.month}: $${parseFloat(t.amount).toFixed(2)}`).join("\n")}

${overBudgetProjects.length > 0 ? `Projects at >80% budget utilization: ${overBudgetProjects.map(p => p.projectName).join(", ")}` : "All projects within budget."}

Return ONLY a valid JSON array with this exact format (no markdown, no explanation):
[{"text": "insight text under 100 chars", "type": "info|warning|tip"}]

Rules:
- "warning" for budget alerts or unusual spending spikes
- "tip" for cost-saving suggestions or best practices
- "info" for factual spending observations
- Be specific with percentages and dollar amounts
`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [{ role: "user", content: dataContext }],
    });

    const content = response.choices[0]?.message?.content ?? "[]";
    let insights: Array<{ text: string; type: string }> = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      insights = [{ text: "Unable to parse AI response. Try again.", type: "info" }];
    }

    res.json({
      insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("AI insights error:", err);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

export default router;
