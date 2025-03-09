import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  // Check if we're signed out by looking at localStorage
  useEffect(() => {
    const user = localStorage.getItem('lvlup-user');
    if (!user) {
      // If no user in localStorage, redirect to login after a short delay
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGoToLogin = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 pb-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold">Page Not Found</h1>
          </div>

          <p className="mt-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or you may need to sign in.
            You'll be redirected to the login page shortly.
          </p>
          
          <Button 
            onClick={handleGoToLogin}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
