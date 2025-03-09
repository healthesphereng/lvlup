import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Task, Category } from "@shared/schema";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: Task;
  category?: Category;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

const TaskCard = ({ task, category, onDelete, showDeleteButton = false }: TaskCardProps) => {
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);

  const updateTaskMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      await apiRequest('PATCH', `/api/tasks/${task.id}/complete`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${task.userId}/tasks`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${task.userId}`] });
      
      if (!isCompleted) {
        toast({
          title: "Task completed!",
          description: `You earned ${task.expReward} XP!`,
        });
      }
    },
    onError: (error) => {
      // Revert UI state if API call fails
      setIsCompleted(!isCompleted);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleComplete = () => {
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    updateTaskMutation.mutate(newCompletedState);
  };

  return (
    <div className={`p-3 border border-gray-100 dark:border-gray-700 rounded-md flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm ${isCompleted ? 'task-complete' : ''}`}>
      <div className="flex items-center flex-1">
        <input 
          type="checkbox" 
          checked={isCompleted} 
          onChange={handleToggleComplete}
          className="appearance-none w-5 h-5 border-2 border-[#00C896] rounded-md bg-transparent cursor-pointer relative
                     checked:bg-[#00C896] checked:border-[#00C896]
                     after:content-[''] after:absolute after:hidden after:left-[5px] after:top-[1px]
                     after:w-[5px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white
                     checked:after:block after:rotate-45"
        />
        <div className="ml-3 flex-1">
          <p className={`font-medium ${isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            {task.title}
          </p>
          <div className="flex items-center mt-1">
            {category && (
              <span 
                className="text-xs py-0.5 px-2 rounded-full"
                style={{
                  backgroundColor: `${category.color}20`, // 20% opacity
                  color: category.color
                }}
              >
                {category.name}
              </span>
            )}
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              +{task.expReward} XP
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {showDeleteButton && (
          <button 
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <div className={`task-streak flex items-center justify-center w-8 h-8 rounded-full ${
          task.streak > 0 
            ? 'bg-[#4CAF50]/10 text-[#4CAF50]' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          <span className="text-xs font-bold">{task.streak}d</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
