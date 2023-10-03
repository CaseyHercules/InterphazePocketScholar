import SignIn from "@/components/SignIn";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/user-auth-form";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

const page: FC = () => {
  return (
    <div className="inset-0">
      <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-20">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "self-start -mt-20"
          )}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Home
        </Link>

        <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <Icons.logo className="mx-auto h-20 w-29" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <UserAuthForm />
            <p></p>
            <p></p>
            <p></p>
            <p></p>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            New to Interphaze?{" "}
            <Link
              href="/sign-up"
              className="hover:text-primary text-sm underline underline-offset-4"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
