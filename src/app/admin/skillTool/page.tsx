"use client";

import { SkillForm } from "@/components/SkillForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const page = () => {
  return (
    <div className="container flex items-center w-full h-full mx-auto ">
      <div className="relative bg-background w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-semibold text-right">Class Tool</h1>
        </div>

        <hr className="bg-foreground h-px" />

        <div>
          <Card className="p-4 w-[1000]">
            <CardHeader>
              <CardTitle>SkillTool</CardTitle>
              <CardDescription>
                Admin Utility, Will updated all other players data. Used to
                create and update skills.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SkillForm data={null} />
            </CardContent>
            <CardFooter className="text-xs justify-center text-stone-500">
              Created and Maintained By Casey Holman
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default page;
