import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Challenge } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Trophy, Target, Award, Plus } from "lucide-react";
import ChallengeCard from "@/components/ChallengeCard";
import { useToast } from "@/hooks/use-toast";

const Challenges = () => {
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    requiredCount: 10,
    expReward: 100,
    badgeName: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, we would get the user ID from auth context
    // For MVP, we'll get it from local storage
    const storedUser = localStorage.getItem('lvlup-user');
    if (storedUser) {
      setUserId(JSON.parse(storedUser).id);
    } else {
      setUserId(1); // Fallback to ID 1 for demo purposes
    }
  }, []);

  const { data: challenges, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/challenges`],
    enabled: !!userId,
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: any) => {
      return await apiRequest('POST', '/api/challenges', challengeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/challenges`] });
      setShowAddChallenge(false);
      setNewChallenge({
        title: "",
        description: "",
        requiredCount: 10,
        expReward: 100,
        badgeName: "",
      });
      toast({
        title: "Challenge created",
        description: "Your new challenge has been created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateChallengeProgressMutation = useMutation({
    mutationFn: async ({ id, currentCount }: { id: number, currentCount: number }) => {
      return await apiRequest('PATCH', `/api/challenges/${id}/progress`, { currentCount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/challenges`] });
      toast({
        title: "Progress updated",
        description: "Challenge progress has been updated!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateChallenge = () => {
    if (!newChallenge.title || !newChallenge.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createChallengeMutation.mutate({
      ...newChallenge,
      userId: userId,
    });
  };

  const handleIncrementProgress = (challenge: Challenge) => {
    if (challenge.currentCount < challenge.requiredCount) {
      updateChallengeProgressMutation.mutate({
        id: challenge.id,
        currentCount: challenge.currentCount + 1,
      });
    }
  };

  // Filter active and completed challenges
  const activeAndCompletedChallenges = challenges ? {
    active: challenges.filter((c: Challenge) => !c.isCompleted),
    completed: challenges.filter((c: Challenge) => c.isCompleted),
  } : { active: [], completed: [] };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-poppins font-bold">Challenges</h1>
          <p className="text-muted-foreground">
            Complete challenges to earn badges and XP!
          </p>
        </div>
        <Button 
          onClick={() => setShowAddChallenge(true)} 
          className="bg-[#FF8C42] hover:bg-[#e67e3a]"
        >
          <Plus className="mr-2 h-4 w-4" /> New Challenge
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-md"></div>
          ))}
        </div>
      ) : (
        <>
          <h2 className="text-xl font-poppins font-semibold mb-4 flex items-center">
            <Target className="mr-2 h-5 w-5 text-[#FF8C42]" /> Active Challenges
          </h2>
          
          {activeAndCompletedChallenges.active.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {activeAndCompletedChallenges.active.map((challenge: Challenge) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge} 
                  onIncrement={() => handleIncrementProgress(challenge)}
                  detailed
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center mb-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Challenges</h3>
              <p className="text-muted-foreground mb-4">
                Create a new challenge to start earning rewards!
              </p>
              <Button 
                onClick={() => setShowAddChallenge(true)} 
                className="bg-[#FF8C42] hover:bg-[#e67e3a]"
              >
                <Plus className="mr-2 h-4 w-4" /> New Challenge
              </Button>
            </div>
          )}

          <h2 className="text-xl font-poppins font-semibold mb-4 flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-[#4CAF50]" /> Completed Challenges
          </h2>
          
          {activeAndCompletedChallenges.completed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeAndCompletedChallenges.completed.map((challenge: Challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} detailed />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Completed Challenges Yet</h3>
              <p className="text-muted-foreground">
                Complete challenges to see them here!
              </p>
            </div>
          )}
        </>
      )}

      {/* Add Challenge Dialog */}
      <Dialog open={showAddChallenge} onOpenChange={setShowAddChallenge}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Challenge Title</label>
              <Input
                id="title"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                placeholder="e.g., Fitness February"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                placeholder="e.g., Complete 10 workouts in February"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="requiredCount" className="text-sm font-medium">Required Count</label>
                <Input
                  id="requiredCount"
                  type="number"
                  min="1"
                  value={newChallenge.requiredCount}
                  onChange={(e) => setNewChallenge({ ...newChallenge, requiredCount: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="expReward" className="text-sm font-medium">XP Reward</label>
                <Input
                  id="expReward"
                  type="number"
                  min="1"
                  value={newChallenge.expReward}
                  onChange={(e) => setNewChallenge({ ...newChallenge, expReward: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="badgeName" className="text-sm font-medium">Badge Name (Optional)</label>
              <Input
                id="badgeName"
                value={newChallenge.badgeName}
                onChange={(e) => setNewChallenge({ ...newChallenge, badgeName: e.target.value })}
                placeholder="e.g., Fitness Expert"
              />
              <p className="text-xs text-muted-foreground">
                If provided, a badge with this name will be awarded upon completion.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2">Challenge Preview</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{newChallenge.title || "Challenge Title"}</p>
                  <p className="text-sm text-muted-foreground">{newChallenge.description || "Challenge description"}</p>
                </div>
                <Badge variant="outline" className="bg-[#FF8C42] text-white">
                  0/{newChallenge.requiredCount}
                </Badge>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Reward: {newChallenge.expReward} XP
                {newChallenge.badgeName && ` + ${newChallenge.badgeName} badge`}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddChallenge(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateChallenge} 
              className="bg-[#FF8C42] hover:bg-[#e67e3a]"
              disabled={createChallengeMutation.isPending}
            >
              {createChallengeMutation.isPending ? "Creating..." : "Create Challenge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Challenges;
