import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface pageProps {}

const page = () => {
  return (
    <div className="w-full py-16">
      <div className="py-6">
        <Link
          href="/createTopic"
          className={cn(
            buttonVariants({ variant: "subtle" }),
            "self-start -mt-20 text-xl"
          )}
        >
          Add New topics for menubar, Not Super Useful, annoying to remove
        </Link>
      </div>
      <div className="py-6">
        <Link
          href="/createClass"
          className={cn(
            buttonVariants({ variant: "subtle" }),
            "self-start -mt-20 text-xl"
          )}
        >
          createClass Tool for adding new classes, pROBable should be super
          admin only
        </Link>
      </div>
      <div className="py-6">
        <Link
          href="/updateClass"
          className={cn(
            buttonVariants({ variant: "subtle" }),
            "self-start -mt-20 text-xl"
          )}
        >
          update Class, used for updating base stats of classes
        </Link>
      </div>
      <div className="py-6">
        <Link
          href="/dash"
          className={cn(
            buttonVariants({ variant: "subtle" }),
            "self-start -mt-20 text-xl"
          )}
        >
          Dashboard for all things needed for admins and others to do. Review of
          things Far from being started RN
        </Link>
      </div>
      <div className="py-6">
        <Link
          href="/createSkill"
          className={cn(
            buttonVariants({ variant: "subtle" }),
            "self-start -mt-20 text-xl"
          )}
        >
          createSkill, used for making new skills
        </Link>
      </div>
      <div className="py-6">
        <Link
          href="/updateSkill"
          className={cn(
            buttonVariants({ variant: "subtle" }),
            "self-start -mt-20 text-xl"
          )}
        >
          UpdateSkill, used for updating skills values and descriptions
        </Link>
      </div>
      <div className="py-6">
        <Link
          href="/createSpell"
          className={cn(
            buttonVariants({ variant: "subtle" }),
            "self-start -mt-20 text-xl"
          )}
        >
          CreateSpell, used for updating skills values and descriptions
        </Link>
      </div>
      <div className="py-6">
        <Link
          href="/updateSpell"
          className={cn(
            buttonVariants({ variant: "subtle" }),
            "self-start -mt-20 text-xl"
          )}
        >
          UpdateSpell, used for updating skills values and descriptions
        </Link>
      </div>
      <div className="py-6">
        <Link
          href="/createItem"
          className={cn(
            buttonVariants({ variant: "subtle" }),
            "self-start -mt-20 text-xl"
          )}
        >
          createItem, used for updating skills values and descriptions
        </Link>
      </div>
      <div className="py-6">
        <Link
          href="/updateItem"
          className={cn(
            buttonVariants({ variant: "subtle" }),
            "self-start -mt-20 text-xl"
          )}
        >
          UpdateItem, used for updating skills values and descriptions
        </Link>
      </div>
    </div>
  );
};

export default page;
