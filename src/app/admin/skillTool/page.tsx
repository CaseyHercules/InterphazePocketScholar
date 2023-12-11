"use client";

import { SkillForm } from "@/components/SkillForm";
import SkillSearchbar from "@/components/SkillSearchbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SetStateAction, useState } from "react";

const page = () => {
  const [data, setData] = useState(null);

  const handleSearch = (searchResult: SetStateAction<null>) => {
    console.log(searchResult);
    setData(searchResult);
  };

  return (
    <div className="container flex items-center w-full h-full mx-auto ">
      <div className="relative bg-background w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-semibold text-right">Skill Tool</h1>
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
              <SkillSearchbar onSearch={handleSearch} />
            </CardContent>
            <CardContent>
              {data ? <SkillForm data={data} /> : <div></div>}
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
