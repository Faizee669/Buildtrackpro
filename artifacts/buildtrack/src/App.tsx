import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persister } from "@/lib/query-client";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";
import { CurrencyProvider } from "@/lib/currency-context";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetails from "@/pages/project-details";
import Expenses from "@/pages/expenses";
import ExpenseFormPage from "@/pages/expense-form-page";
import Analytics from "@/pages/analytics";
import Jobs from "@/pages/jobs";
import Crew from "@/pages/crew";
import Inventory from "@/pages/inventory";
import ActivityLog from "@/pages/activity-log";
import MasterLedger from "@/pages/master-ledger";
import Settings from "@/pages/settings";
import SharePage from "@/pages/share";
import NotFound from "@/pages/not-found";



function Router() {
  return (
    <Switch>
      {/* Public share page — no auth, no layout */}
      <Route path="/share/:token" component={SharePage} />

      {/* Authenticated app routes */}
      <Route>
        <AppLayout>
          <Switch>
            <Route path="/">
              <Redirect to="/dashboard" />
            </Route>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/projects" component={Projects} />
            <Route path="/projects/:id" component={ProjectDetails} />
            <Route path="/expenses" component={Expenses} />
            <Route path="/add-expense" component={ExpenseFormPage} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/jobs" component={Jobs} />
            <Route path="/crew" component={Crew} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/activity" component={ActivityLog} />
            <Route path="/ledger" component={MasterLedger} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ 
        persister,
        // Never persist auth state — stale null in IDB causes flash-to-login on reload
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.queryKey[0] !== "authUser",
        },
      }}
    >
      <CurrencyProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </CurrencyProvider>
    </PersistQueryClientProvider>
  );
}

export default App;
