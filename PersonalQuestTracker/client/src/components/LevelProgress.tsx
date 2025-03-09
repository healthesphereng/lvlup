import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";

interface LevelProgressProps {
  level: number;
  currentExp: number;
  expForNextLevel: number;
  onAddTask: () => void;
}

const LevelProgress = ({ level, currentExp, expForNextLevel, onAddTask }: LevelProgressProps) => {
  // Calculate progress percentage
  const progressPercentage = (currentExp / expForNextLevel) * 100;
  
  // Determine level title based on level
  const getLevelTitle = (level: number) => {
    if (level <= 3) return "Novice";
    if (level <= 7) return "Explorer";
    if (level <= 12) return "Achiever";
    if (level <= 18) return "Expert";
    if (level <= 25) return "Master";
    return "Legend";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="level-badge w-14 h-14 rounded-full bg-[#00C896] flex items-center justify-center text-white">
            <span className="text-lg font-bold">{level}</span>
          </div>
          <div className="ml-4">
            <h2 className="font-poppins font-semibold text-lg">Level {level} {getLevelTitle(level)}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentExp}/{expForNextLevel} XP to Level {level+1}</p>
          </div>
        </div>
        <div>
          <Button 
            onClick={onAddTask} 
            className="bg-[#FF8C42] hover:bg-[#e67e3a] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </div>
  );
};

export default LevelProgress;
