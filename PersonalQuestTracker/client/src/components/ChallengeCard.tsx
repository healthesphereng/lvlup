import { Challenge } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusCircle, Award, Zap } from "lucide-react";

interface ChallengeCardProps {
  challenge: Challenge;
  onIncrement?: () => void;
  detailed?: boolean;
}

const ChallengeCard = ({ challenge, onIncrement, detailed = false }: ChallengeCardProps) => {
  const progress = (challenge.currentCount / challenge.requiredCount) * 100;
  const isCompleted = challenge.isCompleted || challenge.currentCount >= challenge.requiredCount;

  const getChallengeIcon = () => {
    // These could be mapped to different icons based on challenge types
    // For now we're using simple icons
    if (challenge.title.toLowerCase().includes('fitness') || challenge.title.toLowerCase().includes('workout')) {
      return <Zap className="h-5 w-5 text-[#FF8C42]" />;
    } else if (challenge.title.toLowerCase().includes('read') || challenge.title.toLowerCase().includes('book')) {
      return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00C896]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>;
    } else {
      return <Award className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-md p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            {getChallengeIcon()}
            <h3 className="ml-2 font-medium">{challenge.title}</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{challenge.description}</p>
        </div>
        <span className={`text-xs font-medium py-1 px-2 rounded-full ${
          isCompleted 
            ? 'bg-[#4CAF50]/10 text-[#4CAF50]' 
            : 'bg-[#FF8C42]/10 text-[#FF8C42]'
        }`}>
          {challenge.currentCount}/{challenge.requiredCount}
        </span>
      </div>
      
      <div className="mt-3">
        <Progress value={progress} className="h-2" />
      </div>
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Reward: {challenge.expReward} XP
        {challenge.badgeName && ` + ${challenge.badgeName} badge`}
      </div>
      
      {detailed && !isCompleted && onIncrement && (
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onIncrement}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Mark Progress
          </Button>
        </div>
      )}
      
      {detailed && isCompleted && (
        <div className="mt-4 bg-[#4CAF50]/10 p-2 rounded-md text-xs text-center text-[#4CAF50] font-medium">
          Challenge completed! XP and rewards have been credited.
        </div>
      )}
    </div>
  );
};

export default ChallengeCard;
