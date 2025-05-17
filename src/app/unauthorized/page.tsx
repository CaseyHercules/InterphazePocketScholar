import { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Unauthorized Access",
  description: "You do not have permission to access this resource.",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-xl font-bold text-red-600">
          Unauthorized Access
        </h1>
        <div className="mb-4">
          <p className="text-gray-700">
            You do not have permission to access this resource.
          </p>
          <p className="mt-2 text-gray-600">
            If you believe this is an error, please contact an administrator.
          </p>
        </div>
        <div className="mt-6 flex gap-4">
          <Link href="/" className={buttonVariants()}>
            Return Home
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline" })}
          >
            Login as Different User
          </Link>
        </div>
      </div>
    </div>
  );
}
