import { Icons } from "@/components/ui/icons";
import { UserAuthForm } from "@/components/user-auth-form";
import Link from "next/link";
import { Suspense } from "react";

const SignIn = () => {
  return (
    <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-20 w-29" />
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <Suspense fallback={<div className="grid gap-6 animate-pulse"><div className="h-10 bg-muted rounded" /><div className="h-10 bg-muted rounded" /></div>}>
          <UserAuthForm />
        </Suspense>
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
  );
};

export default SignIn;
