import { Badge as BadgeType } from "@shared/schema";
import { Award } from "lucide-react";

interface AchievementsListProps {
  badges: BadgeType[];
  isLoading: boolean;
}

const AchievementsList = ({ badges, isLoading }: AchievementsListProps) => {
  const getIconForBadge = (badge: BadgeType) => {
    // Simple mapping based on badge names
    // In a real app, this could be more sophisticated or stored in the database
    return <Award className="h-6 w-6 text-white" />;
  };
  
  const getBadgeColor = (index: number) => {
    const colors = [
      "bg-yellow-500", // Gold
      "bg-blue-500",   // Blue
      "bg-purple-500", // Purple
      "bg-green-500",  // Green
      "bg-red-500",    // Red
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 transition-colors duration-300">
      <h2 className="font-poppins font-semibold text-lg mb-4">Recent Achievements</h2>
      
      {isLoading ? (
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-16 animate-pulse">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : badges.length > 0 ? (
        <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
          {badges.map((badge, index) => (
            <div key={badge.id} className="flex-shrink-0 w-16 text-center">
              <div className={`w-12 h-12 mx-auto rounded-full ${getBadgeColor(index)} flex items-center justify-center`}>
                {getIconForBadge(badge)}
              </div>
              <p className="mt-2 text-xs font-medium">{badge.name}</p>
            </div>
          ))}
          
          {/* Locked badge example */}
          <div className="flex-shrink-0 w-16 text-center opacity-40">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-400 flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            <p className="mt-2 text-xs font-medium">Locked</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <Award className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Complete challenges to earn badges!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsList;
