import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Task, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskCard from "@/components/TaskCard";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Tasks = () => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
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

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: [`/api/users/${userId}/tasks`],
    enabled: !!userId,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
    enabled: !!userId,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest('DELETE', `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/tasks`] });
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteTask = (taskId: number) => {
    deleteTaskMutation.mutate(taskId);
  };

  // Group tasks by category
  const tasksByCategory: Record<string, Task[]> = {};
  
  if (tasks && categories) {
    categories.forEach((category: Category) => {
      tasksByCategory[category.id] = tasks.filter((task: Task) => task.categoryId === category.id);
    });
    
    // Add an "All" category
    tasksByCategory['all'] = tasks;
    
    // Add a "Completed" category
    tasksByCategory['completed'] = tasks.filter((task: Task) => task.isCompleted);
    
    // Add an "Incomplete" category
    tasksByCategory['incomplete'] = tasks.filter((task: Task) => !task.isCompleted);
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-poppins font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your daily tasks.
          </p>
        </div>
        <Button 
          onClick={() => setShowAddTask(true)} 
          className="bg-[#00C896] hover:bg-[#00a07a]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      {isLoadingTasks || isLoadingCategories ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-md"></div>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            {categories?.map((category: Category) => (
              <TabsTrigger key={category.id} value={String(category.id)}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {tasksByCategory.all?.length > 0 ? (
              tasksByCategory.all.map((task: Task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  category={categories?.find((c: Category) => c.id === task.categoryId)}
                  onDelete={() => handleDeleteTask(task.id)}
                  showDeleteButton
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tasks yet! Click "Add Task" to get started.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="incomplete" className="space-y-4">
            {tasksByCategory.incomplete?.length > 0 ? (
              tasksByCategory.incomplete.map((task: Task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  category={categories?.find((c: Category) => c.id === task.categoryId)}
                  onDelete={() => handleDeleteTask(task.id)}
                  showDeleteButton
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No incomplete tasks!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {tasksByCategory.completed?.length > 0 ? (
              tasksByCategory.completed.map((task: Task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  category={categories?.find((c: Category) => c.id === task.categoryId)}
                  onDelete={() => handleDeleteTask(task.id)}
                  showDeleteButton
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No completed tasks yet!</p>
              </div>
            )}
          </TabsContent>

          {categories?.map((category: Category) => (
            <TabsContent key={category.id} value={String(category.id)} className="space-y-4">
              {tasksByCategory[category.id]?.length > 0 ? (
                tasksByCategory[category.id].map((task: Task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={category}
                    onDelete={() => handleDeleteTask(task.id)}
                    showDeleteButton
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tasks in this category yet!</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Add Task Dialog */}
      {showAddTask && (
        <CreateTaskDialog
          categories={categories || []}
          userId={userId || 1}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </div>
  );
};

export default Tasks;
