"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SignInPromptProps {
  eventId: string;
}

export function SignInPrompt({ eventId }: SignInPromptProps) {
  const router = useRouter();

  const handleSignIn = () => {
    // Store the current URL to redirect back after login
    if (typeof window !== "undefined") {
      localStorage.setItem("loginRedirect", `/events/${eventId}`);
    }
    router.push("/auth/signin");
  };

  return (
    <div className="mt-8 p-6 border rounded-lg bg-muted/30 text-center">
      <h3 className="text-lg font-medium mb-2">Join us at this event!</h3>
      <p className="mb-4">
        Sign in or create an account to register for this event.
      </p>
      <div className="flex justify-center gap-4">
        <Button onClick={handleSignIn}>Sign In</Button>
      </div>
    </div>
  );
}
