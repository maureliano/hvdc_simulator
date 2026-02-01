import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import IFFAnalytics from "./pages/IFFAnalytics";
import IFFTestScenarios from "./pages/IFFTestScenarios";
import Supervisory from "./pages/Supervisory";
import { AlarmHistory } from "./pages/AlarmHistory";
import TrendAnalysis from "./pages/TrendAnalysis";
import { ResearchResults } from "./pages/ResearchResults";
import EventHistory from "./pages/EventHistory";
import Tests from "./pages/Tests";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/iff-analytics" component={IFFAnalytics} />
      <Route path="/iff-test-scenarios" component={IFFTestScenarios} />
      <Route path="/supervisory" component={Supervisory} />
      <Route path="/alarm-history" component={AlarmHistory} />
      <Route path="/trend-analysis" component={TrendAnalysis} />
      <Route path="/research-results" component={ResearchResults} />
      <Route path="/event-history" component={EventHistory} />
      <Route path="/tests" component={Tests} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
