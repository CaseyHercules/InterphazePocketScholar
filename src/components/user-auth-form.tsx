"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useToast } from "../hooks/use-toast";
import { useSearchParams } from "next/navigation";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const loginWith = async (authProvider: string) => {
    setIsLoading(true);

    try {
      await signIn(authProvider, {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error logging in with " + authProvider + ".",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Please sign in with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={() => {
          loginWith("wordpress").catch((error) => {});
        }}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.wordpress className="mr-2 h-4 w-4" />
        )}
        {"\u00A0"}
        Wordpress
      </Button>
      {/* <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={() => {
          loginWith("google").catch((error) => {});
        }}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button> */}
    </div>
  );
}
