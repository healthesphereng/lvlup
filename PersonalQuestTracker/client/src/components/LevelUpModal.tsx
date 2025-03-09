import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface LevelUpModalProps {
  level: number;
  newPerk?: string;
  onClose: () => void;
}

const LevelUpModal = ({ level, newPerk, onClose }: LevelUpModalProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none">
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full mx-auto text-center ${isAnimating ? 'animate-bounce' : ''}`}
            onAnimationEnd={() => setIsAnimating(false)}>
          <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-poppins font-bold mb-2">Level Up!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Congratulations! You've reached <span className="font-bold text-[#00C896]">Level {level}</span>
          </p>
          {newPerk && (
            <p className="text-sm mb-4">New perk unlocked: <span className="font-medium">{newPerk}</span></p>
          )}
          <Button 
            onClick={onClose}
            className="bg-[#00C896] hover:bg-[#00a07a] text-white px-6 py-2 rounded-md text-sm font-medium"
          >
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpModal;
