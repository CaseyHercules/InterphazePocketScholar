import { buttonVariants } from "@/components/ui/button";
import { toast } from "./use-toast";
import Link from "next/link";

export const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: "Login required",
      description: "You must be logged in to create a request",
      variant: "destructive",
      action: (
        <Link
          href="/login"
          onClick={() => dismiss()}
          className={buttonVariants({ variant: "outline" })}
        >
          Login
        </Link>
      ),
    });
  };

  return {
    loginToast,
  };
};
