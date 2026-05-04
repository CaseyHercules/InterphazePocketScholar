import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

type AdminLinkItem =
  | {
      href: string;
      title: string;
      description: string;
      external?: false;
    }
  | {
      href: string;
      title: string;
      description: string;
      external: true;
    };

const ADMIN_LINKS: AdminLinkItem[] = [
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
    href: "/admin/media",
    title: "Site media",
    description:
      "Upload home gallery and page background images via UploadThing (admin only).",
  },
  {
    href: "/admin/passports",
    title: "Passport Management",
    description: "Create, assign, and edit character passports. Assign passports to users by email or username.",
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
    description:
      "Update and manage spell values and descriptions. Review queue: /admin/spellTool?view=review or /admin/spellTool/review.",
  },
  {
    href: "/admin/printing",
    title: "Card Printing",
    description:
      "Preview print-ready card templates and print spell cards to PDF.",
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
  const scanUrl = process.env.NEXT_PUBLIC_SPELL_SCAN_APP_URL?.trim();
  const links: AdminLinkItem[] = scanUrl
    ? [
        ...ADMIN_LINKS,
        {
          href: scanUrl,
          title: "Spell card scan",
          description:
            "Capture a spell card with your phone and import into the database (opens separate app).",
          external: true,
        },
      ]
    : ADMIN_LINKS;

  return (
    <div className="w-full py-12 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Admin Tools</h1>
        <p className="text-sm text-muted-foreground">
          Manage events, content, and game data from one place.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((link) =>
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="h-full transition-colors group-hover:border-primary/50 group-hover:bg-muted/40">
                <CardHeader>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </a>
          ) : (
            <Link key={link.href} href={link.href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50 group-hover:bg-muted/40">
                <CardHeader>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default Page;
