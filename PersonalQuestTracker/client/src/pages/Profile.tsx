import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Badge as BadgeType } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, BarChart, Settings, Trophy, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, we would get the user ID from auth context
    // For MVP, we'll get it from local storage
    const storedUser = localStorage.getItem('lvlup-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const userId = user?.id || 1; // Fallback to ID 1 for demo purposes

  const { data: userProfile, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const { data: badges, isLoading: isLoadingBadges } = useQuery({
    queryKey: [`/api/users/${userId}/badges`],
    enabled: !!userId,
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: [`/api/users/${userId}/tasks`],
    enabled: !!userId,
  });

  const { data: challenges, isLoading: isLoadingChallenges } = useQuery({
    queryKey: [`/api/users/${userId}/challenges`],
    enabled: !!userId,
  });

  const handlePrestigeReset = () => {
    toast({
      title: "Coming Soon!",
      description: "Prestige mode is not available in this version.",
    });
  };

  const completedTasksCount = tasks?.filter((task: any) => task.isCompleted)?.length || 0;
  const completedChallengesCount = challenges?.filter((challenge: any) => challenge.isCompleted)?.length || 0;

  // Stats calculation
  const stats = [
    { 
      label: "Tasks Completed", 
      value: completedTasksCount,
      icon: <BarChart className="h-5 w-5 text-primary" />
    },
    { 
      label: "Challenges Completed", 
      value: completedChallengesCount,
      icon: <Trophy className="h-5 w-5 text-[#FF8C42]" />
    },
    { 
      label: "Badges Earned", 
      value: badges?.length || 0,
      icon: <Award className="h-5 w-5 text-[#4CAF50]" />
    },
    { 
      label: "Current Level", 
      value: userProfile?.level || 1,
      icon: <UserCircle className="h-5 w-5 text-[#9B51E0]" />
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-poppins font-bold">Profile</h1>
        <p className="text-muted-foreground">
          View your progress and achievements.
        </p>
      </div>

      {isLoadingUser ? (
        <div className="h-40 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-md mb-6"></div>
      ) : (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center">
              <Avatar className="h-24 w-24 mb-4 md:mb-0 md:mr-6 bg-primary text-white">
                <AvatarFallback className="text-xl">
                  {userProfile?.username?.slice(0, 2).toUpperCase() || 'UN'}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-poppins font-semibold">{userProfile?.username || 'User'}</h2>
                <p className="text-muted-foreground mb-2">
                  Level {userProfile?.level || 1} • {userProfile?.exp || 0} XP total
                </p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Level {userProfile?.level || 1}</span>
                    <span>Level {(userProfile?.level || 1) + 1}</span>
                  </div>
                  <Progress 
                    value={(userProfile?.currentExp / userProfile?.expForNextLevel) * 100 || 0} 
                    className="h-2"
                  />
                  <p className="text-xs text-center mt-1 text-muted-foreground">
                    {userProfile?.currentExp || 0}/{userProfile?.expForNextLevel || 100} XP needed
                  </p>
                </div>
              </div>
              
              {(userProfile?.level >= 10) && (
                <div className="mt-4 md:mt-0">
                  <Button
                    onClick={handlePrestigeReset}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  >
                    <Trophy className="mr-2 h-4 w-4" /> Prestige Reset
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {isLoadingUser ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-md"></div>
          ))
        ) : (
          stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <div className="mb-2">{stat.icon}</div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground text-center">{stat.label}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Tabs defaultValue="badges">
        <TabsList className="mb-4">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-[#FFD700]" /> 
                Earned Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBadges ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-md"></div>
                  ))}
                </div>
              ) : badges?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map((badge: BadgeType) => (
                    <div key={badge.id} className="flex flex-col items-center p-4 border rounded-md">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-center">{badge.name}</p>
                      <p className="text-xs text-muted-foreground text-center mt-1">{badge.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-2">No badges earned yet</p>
                  <p className="text-xs text-muted-foreground">
                    Complete challenges to earn badges!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-primary" /> 
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">Tasks Completion Rate</p>
                    <p className="text-sm font-medium">{tasks?.length ? Math.round((completedTasksCount / tasks.length) * 100) : 0}%</p>
                  </div>
                  <Progress 
                    value={tasks?.length ? (completedTasksCount / tasks.length) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">Challenge Completion Rate</p>
                    <p className="text-sm font-medium">{challenges?.length ? Math.round((completedChallengesCount / challenges.length) * 100) : 0}%</p>
                  </div>
                  <Progress 
                    value={challenges?.length ? (completedChallengesCount / challenges.length) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">Level Progress</p>
                    <p className="text-sm font-medium">{Math.round((userProfile?.currentExp / userProfile?.expForNextLevel) * 100 || 0)}%</p>
                  </div>
                  <Progress 
                    value={(userProfile?.currentExp / userProfile?.expForNextLevel) * 100 || 0} 
                    className="h-2"
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">Achievement Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium">Tasks</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Completed</span>
                        <span className="text-xs font-medium">{completedTasksCount}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Total</span>
                        <span className="text-xs font-medium">{tasks?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium">Challenges</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Completed</span>
                        <span className="text-xs font-medium">{completedChallengesCount}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Total</span>
                        <span className="text-xs font-medium">{challenges?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-gray-500" /> 
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Theme Preferences</h3>
                  <div className="flex space-x-3">
                    <Button variant="outline" className="flex-1">Light</Button>
                    <Button variant="outline" className="flex-1">Dark</Button>
                    <Button variant="outline" className="flex-1">System</Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Notification Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="daily-reminder" className="text-sm">Daily Task Reminders</label>
                      <input 
                        type="checkbox" 
                        id="daily-reminder"
                        className="w-4 h-4 text-primary rounded border-gray-300"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="level-up" className="text-sm">Level Up Notifications</label>
                      <input 
                        type="checkbox" 
                        id="level-up"
                        className="w-4 h-4 text-primary rounded border-gray-300"
                        defaultChecked
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="challenge-updates" className="text-sm">Challenge Updates</label>
                      <input 
                        type="checkbox" 
                        id="challenge-updates"
                        className="w-4 h-4 text-primary rounded border-gray-300"
                        defaultChecked
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Account</h3>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      localStorage.removeItem('lvlup-user');
                      window.location.href = "/";
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
