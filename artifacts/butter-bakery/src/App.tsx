import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LandingPage from "@/pages/LandingPage";
import InvestorRelations from "@/pages/InvestorRelations";
import News from "@/pages/News";
import NotFound from "@/pages/not-found";
import StaffLogin from "@/pages/staff/StaffLogin";
import StaffLibrary from "@/pages/staff/StaffLibrary";
import StaffAdmin from "@/pages/staff/StaffAdmin";
import StaffGuide from "@/pages/staff/StaffGuide";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/investor-relations" component={InvestorRelations} />
      <Route path="/news" component={News} />
      <Route path="/staff" component={StaffLogin} />
      <Route path="/staff/library" component={StaffLibrary} />
      <Route path="/staff/admin" component={StaffAdmin} />
      <Route path="/staff/guide" component={StaffGuide} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
