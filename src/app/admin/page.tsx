import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface pageProps {}

const Page = () => {
  return (
    <div className="w-full py-16">
      {entry(
        "/admin/dash",
        "Dashboard for all things needed for admins and others to do. Review of things Far from being started RN"
      )}
      {entry("/admin/classTool", "ClassTool for updating and making classes")}
      {entry(
        "/admin/skillTool",
        "SkillTool, used for updating and making skill's values and descriptions"
      )}
      {entry(
        "/admin/spellTool",
        "Spelltool, used for updating spells values and descriptions"
      )}
      {entry(
        "/admin/itemTool",
        "ItemTool, used for updating skills values and descriptions"
      )}
      {entry(
        "/admin/createTopic",
        "Makes a new topic that casey has to setup in the backend"
      )}
    </div>
  );
};

function entry(url: string, desc: string) {
  return (
    <div className="py-6">
      <Link
        href={url}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "self-start -mt-20 text-xl"
        )}
      >
        {desc}
      </Link>
    </div>
  );
}

export default Page;
