import { Metadata } from "next";
import SignUp from "@/components/SignUp";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default function AuthenticationPage() {
  return (
    <>
      <div className="container relative h-[800px] flex-col items-center justify-center">
        <div className="lg:p-8">
          <SignUp />
        </div>
      </div>
    </>
  );
}
