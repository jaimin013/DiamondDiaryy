import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import Members from "@/pages/members";
import AddMember from "@/pages/add-member";
import EditMember from "@/pages/edit-member";
import MemberCalendar from "@/pages/member-calendar";
import AddDiamonds from "@/pages/add-diamonds";
import DiamondPrices from "@/pages/diamond-prices";
import ViewDiamonds from "@/pages/view-diamonds";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import "./lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/members" component={Members} />
      <ProtectedRoute path="/add-member" component={AddMember} />
      <ProtectedRoute path="/member/:id/edit" component={EditMember} />
      <ProtectedRoute path="/member/:id/calendar" component={MemberCalendar} />
      <ProtectedRoute path="/member/:id/add-diamonds" component={AddDiamonds} />
      <ProtectedRoute path="/diamond-prices" component={DiamondPrices} />
      <ProtectedRoute path="/member/:id/view" component={ViewDiamonds} />
      <ProtectedRoute path="/view-diamonds" component={ViewDiamonds} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
