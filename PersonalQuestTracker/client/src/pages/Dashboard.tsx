import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import LevelProgress from "@/components/LevelProgress";
import StatsCard from "@/components/StatsCard";
import TaskCard from "@/components/TaskCard";
import ChallengeCard from "@/components/ChallengeCard";
import AchievementsList from "@/components/AchievementsList";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import { Task, Category, Badge, Challenge } from "@shared/schema";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [showAddTask, setShowAddTask] = useState(false);

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

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: [`/api/users/${userId}/tasks`],
    enabled: !!userId,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
    enabled: !!userId,
  });

  const { data: challenges, isLoading: isLoadingChallenges } = useQuery({
    queryKey: [`/api/users/${userId}/challenges`],
    enabled: !!userId,
  });

  const { data: badges, isLoading: isLoadingBadges } = useQuery({
    queryKey: [`/api/users/${userId}/badges`],
    enabled: !!userId,
  });

  const completedTasksCount = tasks?.filter((task: Task) => task.isCompleted)?.length || 0;
  const totalTasksCount = tasks?.length || 0;

  // Find the task with the highest streak
  const highestStreak = tasks?.reduce((max: number, task: Task) => 
    task.streak > max ? task.streak : max, 0) || 0;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-poppins font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userProfile?.username || 'User'}! You're making great progress.
        </p>
      </div>

      {/* Level Progress */}
      <LevelProgress 
        level={userProfile?.level || 1}
        currentExp={userProfile?.currentExp || 0}
        expForNextLevel={userProfile?.expForNextLevel || 100}
        onAddTask={() => setShowAddTask(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="font-poppins font-semibold text-lg">Today's Tasks</h2>
              <span className="text-xs font-medium bg-primary bg-opacity-10 text-primary py-1 px-2 rounded-full">
                {completedTasksCount}/{totalTasksCount} completed
              </span>
            </div>
          </div>
          <div className="p-5">
            {isLoadingTasks ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : tasks?.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task: Task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={categories?.find((c: Category) => c.id === task.categoryId)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No tasks yet! Click "Add Task" to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats & Challenges Section */}
        <div className="space-y-6">
          {/* Stats Card */}
          <StatsCard
            tasksCompleted={completedTasksCount}
            currentStreak={highestStreak}
            badgesEarned={badges?.length || 0}
          />

          {/* Active Challenges */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-poppins font-semibold text-lg">Active Challenges</h2>
              <a href="/challenges" className="text-primary text-sm font-medium">View all</a>
            </div>
            
            {isLoadingChallenges ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : challenges?.length > 0 ? (
              <div className="space-y-4">
                {challenges.slice(0, 2).map((challenge: Challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No active challenges. Check back soon!</p>
              </div>
            )}
          </div>

          {/* Achievements */}
          <AchievementsList badges={badges || []} isLoading={isLoadingBadges} />
        </div>
      </div>

      {/* Add Task Dialog */}
      {showAddTask && (
        <CreateTaskDialog
          categories={categories || []}
          userId={userId}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
