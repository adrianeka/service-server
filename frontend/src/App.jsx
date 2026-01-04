import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./page/DashboardPage";
import TestPage from "./testpage/page";
import { TooltipProvider } from "./components/ui/tooltip";
import "./App.css";
import LoginPage from "./page/LoginPage";
import RegisterPage from "./page/RegisterPage";
import ProfilePage from "./page/ProfilePage";
import NotificationPage from "./page/NotificationPage";
import DetailMonitorPage from "./page/DetailMonitorPage";

const queryClient = new QueryClient();

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      "dark",
      "theme-midnight",
      "theme-forest",
      "theme-cosmic",
      "theme-claude"
    );

    if (theme !== "light") {
      root.classList.add("dark");
      if (theme !== "dark") {
        root.classList.add(theme);
      }
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Router>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/Login" element={<LoginPage />} />
              <Route path="/Register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={<DashboardPage theme={theme} setTheme={setTheme} />}
              />
              <Route
                path="/Dashboard1"
                element={<DashboardPage theme={theme} setTheme={setTheme} />}
              />
              <Route path="/Profile" element={<ProfilePage />} />
              <Route path="/Notification" element={<NotificationPage />} />
              <Route path="/monitor/:id" element={<DetailMonitorPage />} />
            </Routes>
          </Router>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;