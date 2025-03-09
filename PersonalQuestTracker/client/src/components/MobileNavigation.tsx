import { useLocation } from "wouter";
import { Gauge, ClipboardCheck, Target, BarChart2, UserCircle } from "lucide-react";

const MobileNavigation = () => {
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Gauge className="h-6 w-6" /> },
    { path: "/tasks", label: "Tasks", icon: <ClipboardCheck className="h-6 w-6" /> },
    { path: "/challenges", label: "Challenges", icon: <Target className="h-6 w-6" /> },
    { path: "/leaderboard", label: "Leaderboard", icon: <BarChart2 className="h-6 w-6" /> },
    { path: "/profile", label: "Profile", icon: <UserCircle className="h-6 w-6" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-10 transition-colors duration-300">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center py-3 px-4 ${
              location === item.path
                ? "text-[#00C896]"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.path);
            }}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
