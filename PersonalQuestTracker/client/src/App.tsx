import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Challenges from "@/pages/Challenges";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";
import LevelUpModal from "@/components/LevelUpModal";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // This would normally check for auth token, but for MVP we'll just simulate authentication
  useEffect(() => {
    // Check if user is "logged in" in local storage
    const user = localStorage.getItem('lvlup-user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lvlup-user');
    setIsAuthenticated(false);
    // Hard redirect to login page
    window.location.href = "/";
  };

  // Level up modal state
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ level: 0, newPerk: '' });

  return (
    <>
      <div className="flex flex-col md:flex-row h-screen">
        {isAuthenticated && <Sidebar onLogout={handleLogout} />}
        
        <main className="flex-1 overflow-auto bg-background dark:bg-darkBg">
          {isAuthenticated && <MobileNavigation />}
          
          <div className={`${isAuthenticated ? "pb-16 md:pb-0" : ""}`}>
            <Switch>
              {isAuthenticated ? (
                <>
                  <Route path="/" component={Dashboard} />
                  <Route path="/tasks" component={Tasks} />
                  <Route path="/challenges" component={Challenges} />
                  <Route path="/leaderboard" component={Leaderboard} />
                  <Route path="/profile" component={Profile} />
                </>
              ) : (
                <>
                  <Route path="/" component={Login} />
                  <Route path="/register" component={Register} />
                </>
              )}
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
      
      {showLevelUpModal && (
        <LevelUpModal 
          level={levelUpData.level} 
          newPerk={levelUpData.newPerk}
          onClose={() => setShowLevelUpModal(false)}
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
