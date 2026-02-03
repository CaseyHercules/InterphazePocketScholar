import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const ADMIN_LINKS = [
  {
    href: "/admin/dash",
    title: "Admin Dashboard",
    description:
      "Dashboard for all things needed for admins and others to do. Review of things far from being started RN.",
  },
  {
    href: "/admin/events",
    title: "Event Management",
    description: "View, create, and manage events.",
  },
  {
    href: "/admin/users",
    title: "User Management",
    description: "View and edit registered users. Only SUPERADMIN can change roles.",
  },
  {
    href: "/admin/classTool",
    title: "Class Tool",
    description: "Update and create classes.",
  },
  {
    href: "/admin/skillTool",
    title: "Skill Tool",
    description: "Update and manage skill values and descriptions.",
  },
  {
    href: "/admin/spellTool",
    title: "Spell Tool",
    description: "Update and manage spell values and descriptions.",
  },
  {
    href: "/admin/itemTool",
    title: "Item Tool",
    description: "Update and manage item values and descriptions.",
  },
  {
    href: "/admin/adjustments",
    title: "Adjustments",
    description: "Create and manage character modifiers.",
  },
  {
    href: "/admin/createTopic",
    title: "Create Topic",
    description: "Create a new topic for admin setup.",
  },
];

const Page = () => {
  return (
    <div className="w-full py-12 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Admin Tools</h1>
        <p className="text-sm text-muted-foreground">
          Manage events, content, and game data from one place.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {ADMIN_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/50 group-hover:bg-muted/40">
              <CardHeader>
                <CardTitle className="text-lg">{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
