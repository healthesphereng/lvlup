import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Gauge, ClipboardCheck, Target, BarChart2, UserCircle, LogOut, Moon, Sun } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
  const [location, navigate] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if dark mode was previously enabled
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModeEnabled);
    
    if (darkModeEnabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Get user from local storage
    const storedUser = localStorage.getItem('lvlup-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const userId = user?.id;

  const { data: userProfile } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Gauge className="h-5 w-5" /> },
    { path: "/tasks", label: "Tasks", icon: <ClipboardCheck className="h-5 w-5" /> },
    { path: "/challenges", label: "Challenges", icon: <Target className="h-5 w-5" /> },
    { path: "/leaderboard", label: "Leaderboard", icon: <BarChart2 className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  const getInitials = (username: string) => {
    return username?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
      <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#00C896] rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="ml-3 text-xl font-poppins font-bold">Lvl Up</h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pt-5 pb-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="px-4 py-2">
              <a
                href={item.path}
                className={`flex items-center space-x-3 ${
                  location === item.path
                    ? "text-[#00C896] font-medium"
                    : "text-gray-500 dark:text-gray-400 hover:text-[#00C896] dark:hover:text-[#00C896]"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#FF8C42] flex items-center justify-center text-white">
              <span className="font-medium text-sm">{getInitials(userProfile?.username || user?.username || 'User')}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{userProfile?.username || user?.username || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Lvl {userProfile?.level || user?.level || 1} Explorer
              </p>
            </div>
          </div>
          <button 
            onClick={toggleDarkMode} 
            className="text-gray-500 hover:text-[#00C896] dark:text-gray-400 dark:hover:text-[#00C896]"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
        <button
          onClick={onLogout}
          className="mt-4 w-full flex items-center justify-center space-x-2 p-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
