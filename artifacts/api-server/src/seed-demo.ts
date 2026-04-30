import { db } from "../../../lib/db/src/index";
import { usersTable, emailCredentialsTable, projectsTable, phasesTable, expensesTable, vendorsTable } from "../../../lib/db/src/schema/index";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🚀 Starting Demo Seeding...");

  const email = "demo@buildtrack.pro";
  const password = "DemoPassword123!";
  const firstName = "Demo";
  const lastName = "User";

  // 1. Clean up existing demo user
  console.log("🧹 Cleaning up old demo data...");
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    await db.delete(emailCredentialsTable).where(eq(emailCredentialsTable.email, email));
    await db.delete(usersTable).where(eq(usersTable.email, email));
  }

  // 2. Create User
  console.log("👤 Creating Demo User...");
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    email,
    firstName,
    lastName,
  }).returning();

  await db.insert(emailCredentialsTable).values({
    email,
    passwordHash,
    userId: user.id,
  });

  // 3. Create Projects
  console.log("🏗️ Creating Projects...");
  const [p1] = await db.insert(projectsTable).values({
    userId: user.id,
    name: "Riverside Luxury Condos",
    description: "High-end residential development with river views.",
    budget: "500000",
    laborBudget: "200000",
    materialBudget: "300000",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "active",
  }).returning();

  const [p2] = await db.insert(projectsTable).values({
    userId: user.id,
    name: "Central Mall Renovation",
    description: "Modernizing the food court and main entrance.",
    budget: "250000",
    laborBudget: "100000",
    materialBudget: "150000",
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "active",
  }).returning();

  // 4. Create Phases
  console.log("📂 Creating Phases...");
  const phases = [
    { name: "Excavation", projectId: p1.id },
    { name: "Foundation", projectId: p1.id },
    { name: "Framing", projectId: p1.id },
    { name: "Demolition", projectId: p2.id },
    { name: "Electrical", projectId: p2.id },
  ];
  const insertedPhases = await db.insert(phasesTable).values(phases).returning();

  // 5. Create Vendors
  console.log("🏢 Creating Vendors...");
  const vendors = [
    { name: "BuildMart Supplies", category: "Materials" },
    { name: "Steel Works Inc", category: "Materials" },
    { name: "PowerPro Electric", category: "Labor" },
    { name: "SafeGuard Security", category: "Services" },
  ];
  await db.insert(vendorsTable).values(vendors).onConflictDoNothing();

  // 6. Create Expenses
  console.log("💰 Generating Expenses...");
  const expenseData = [];
  const categories = ["Materials", "Labor", "Equipment", "Permits", "Other"];
  const vendorNames = vendors.map(v => v.name);

  for (let i = 0; i < 40; i++) {
    const project = i % 2 === 0 ? p1 : p2;
    const projectPhases = insertedPhases.filter(ph => ph.projectId === project.id);
    const phase = projectPhases[Math.floor(Math.random() * projectPhases.length)];
    
    // Random date within the last 30 days
    const date = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    
    expenseData.push({
      projectId: project.id,
      phaseId: phase.id,
      category: categories[Math.floor(Math.random() * categories.length)],
      amount: (Math.random() * 5000 + 500).toFixed(2),
      vendor: vendorNames[Math.floor(Math.random() * vendorNames.length)],
      date: date.toISOString().split('T')[0],
      notes: `Dummy expense #${i + 1} for demo purposes.`,
    });
  }

  await db.insert(expensesTable).values(expenseData);

  console.log("✅ Seeding Complete!");
  console.log("-------------------");
  console.log("Login Email: " + email);
  console.log("Login Password: " + password);
  console.log("-------------------");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding Failed:", err);
  process.exit(1);
});
