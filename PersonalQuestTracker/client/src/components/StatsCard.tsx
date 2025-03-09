import { CheckCircle, Clock, Award } from "lucide-react";

interface StatsCardProps {
  tasksCompleted: number;
  currentStreak: number;
  badgesEarned: number;
}

const StatsCard = ({ tasksCompleted, currentStreak, badgesEarned }: StatsCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 transition-colors duration-300">
      <h2 className="font-poppins font-semibold text-lg mb-4">Your Stats</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-[#00C896] bg-opacity-10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-[#00C896]" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{tasksCompleted}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tasks Completed</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-[#FF8C42] bg-opacity-10 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-[#FF8C42]" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{currentStreak}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Streak</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-[#4CAF50] bg-opacity-10 rounded-full flex items-center justify-center">
            <Award className="h-6 w-6 text-[#4CAF50]" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{badgesEarned}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Badges Earned</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
