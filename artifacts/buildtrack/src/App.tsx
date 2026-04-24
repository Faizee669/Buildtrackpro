import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import Settings from "@/pages/settings";
import SharePage from "@/pages/share";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

export default App;
