import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Trophy, Medal, Award, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const Leaderboard = () => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // In a real app, we would get the user ID from auth context
    // For MVP, we'll get it from local storage
    const storedUser = localStorage.getItem('lvlup-user');
    if (storedUser) {
      setCurrentUserId(JSON.parse(storedUser).id);
    }
  }, []);

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
  });

  // Get initial letters for avatar
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  // Get trophy icon based on rank
  const getTrophyIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold">{rank}</span>;
    }
  };

  // Get avatar color based on rank
  const getAvatarColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-primary text-white";
    
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-amber-600 text-white";
      default:
        return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-poppins font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank against other users.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-6">
            <Users className="h-16 w-16 text-[#00C896] p-3 bg-[#00C896]/10 rounded-full" />
          </div>
          <h2 className="text-center text-lg font-medium mb-2">Compete with Friends</h2>
          <p className="text-center text-muted-foreground mb-4">
            Complete tasks and challenges to climb the leaderboard!
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-md"></div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-poppins font-semibold">Top Users</h2>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {leaderboard?.map((user: User & { level: number, currentExp: number }, index: number) => {
              const isCurrentUser = user.id === currentUserId;
              
              return (
                <div 
                  key={user.id}
                  className={`p-4 flex items-center ${isCurrentUser ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-center justify-center w-10">
                    {getTrophyIcon(index + 1)}
                  </div>
                  
                  <Avatar className={`h-10 w-10 mr-4 ${getAvatarColor(index + 1, isCurrentUser)}`}>
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium">{user.username}</span>
                      {isCurrentUser && (
                        <Badge className="ml-2 bg-primary text-white" variant="outline">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>Level {user.level}</span>
                      <span className="mx-2">•</span>
                      <span>{user.exp} XP total</span>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex items-center space-x-2">
                    {index === 0 && (
                      <Badge className="bg-yellow-500 text-white">
                        Top User
                      </Badge>
                    )}
                    {user.level >= 10 && (
                      <Badge className="bg-purple-500 text-white">
                        Expert
                      </Badge>
                    )}
                    {user.prestigeLevel > 0 && (
                      <Badge className="bg-blue-500 text-white">
                        Prestige {user.prestigeLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            
            {leaderboard?.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No users on the leaderboard yet!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
