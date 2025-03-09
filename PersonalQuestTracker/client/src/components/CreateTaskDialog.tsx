import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Category } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CreateTaskDialogProps {
  categories: Category[];
  userId: number;
  onClose: () => void;
}

const CreateTaskDialog = ({ categories, userId, onClose }: CreateTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [expReward, setExpReward] = useState("10");
  const { toast } = useToast();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return await apiRequest('POST', '/api/tasks', taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/tasks`] });
      toast({
        title: "Task created",
        description: "Your new task has been added successfully!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!title) {
      toast({
        title: "Title required",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: "Category required",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      title,
      userId,
      categoryId: parseInt(categoryId),
      expReward: parseInt(expReward),
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Task Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter task title"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select onValueChange={setCategoryId} value={categoryId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      ></span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expReward" className="text-right">
              XP Reward
            </Label>
            <Select onValueChange={setExpReward} value={expReward}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select XP amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 XP (Easy)</SelectItem>
                <SelectItem value="10">10 XP (Normal)</SelectItem>
                <SelectItem value="15">15 XP (Medium)</SelectItem>
                <SelectItem value="25">25 XP (Hard)</SelectItem>
                <SelectItem value="50">50 XP (Very Hard)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-[#00C896] hover:bg-[#00a07a]"
            onClick={handleSubmit}
            disabled={createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
