import Link from "next/link";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

import { Menu } from "lucide-react";

// Menu configuration
const MENU_ITEMS = [
  {
    label: "Events",
    items: [
      { label: "Upcoming Events", href: "/events" },
      { label: "Registration", href: "/events/registration" },
    ],
  },
  {
    label: "New to Phaze",
    items: [
      { label: "Intro to Interphaze", href: "/intro/new" },
      { label: "Code of conduct", href: "/intro/conduct" },
      { label: "Character Creation", href: "/intro/character" },
    ],
  },
  {
    label: "Rules",
    items: [
      { label: "Summary", href: "/rules/summary" },
      { label: "Character Advancement", href: "/rules/advancement" },
      {
        label: "Classes",
        href: "/class",
        subItems: [
          { label: "Cleric", href: "/class/cleric" },
          { label: "Druid", href: "/class/druid" },
          { label: "Mage", href: "/class/mage" },
          { label: "Fighter", href: "/class/fighter" },
          { label: "Monk", href: "/class/monk" },
          { label: "Performer", href: "/class/performer" },
          { label: "Psion", href: "/class/psion" },
          { label: "Ranger", href: "/class/ranger" },
          { label: "Rogue", href: "/class/rogue" },
          { label: "Scholar", href: "/class/scholar" },
          { label: "Shaman", href: "/class/shaman" },
        ],
      },
      {
        label: "Races",
        href: "/race",
        subItems: [
          { label: "Dwarf", href: "/race/dwarf" },
          { label: "Elf", href: "/race/elf" },
          { label: "Gnome", href: "/race/gnome" },
          { label: "Half Elf", href: "/race/half-elf" },
          { label: "Half Orc", href: "/race/half-orc" },
          { label: "Halfling", href: "/race/halfling" },
          { label: "Human", href: "/race/human" },
          { label: "Kenogre", href: "/race/kenogre" },
          { label: "Pumerre", href: "/race/pumerre" },
        ],
      },
      { label: "STEP Combat", href: "/rules/combat" },
      { label: "Character Abilities", href: "/rules/abilities" },
      { label: "Items", href: "/rules/items" },
      { label: "Spellcasting", href: "/rules/spellcasting" },
    ],
  },
  {
    label: "Skills",
    items: [{ label: "All Skills", href: "/skills" }],
  },
  {
    label: "World Info",
    items: [
      { label: "Inspiration", href: "/setting/inspiration" },
      { label: "Geography", href: "/setting/geography" },
      { label: "History", href: "/setting/history" },
      { label: "Economy", href: "/setting/economy" },
      { label: "Laws", href: "/setting/laws" },
      { label: "Society", href: "/setting/society" },
      { label: "Religion", href: "/setting/religion" },
      { label: "Guilds", href: "/setting/guilds" },
    ],
  },
  {
    label: "About",
    items: [
      { label: "Why Us", href: "/about/us" },
      { label: "Our Team", href: "/about/team" },
      { label: "Contact us", href: "/about/contact" },
      { label: "Join our Team", href: "/about/join" },
    ],
  },
];

// Reusable menu item component
const MenuItem = ({ item }: { item: any }) => {
  if (item.subItems) {
    return (
      <MenubarSub>
        <MenubarSubTrigger asChild>
          <Link href={item.href}>{item.label}</Link>
        </MenubarSubTrigger>
        <MenubarSubContent>
          {item.subItems.map((subItem: any) => (
            <MenubarItem key={subItem.href} asChild>
              <Link href={subItem.href}>{subItem.label}</Link>
            </MenubarItem>
          ))}
        </MenubarSubContent>
      </MenubarSub>
    );
  }

  return (
    <MenubarItem asChild>
      <Link href={item.href}>{item.label}</Link>
    </MenubarItem>
  );
};

// Menu content component
const MenuContent = ({
  items,
  isNested = false,
}: {
  items: any[];
  isNested?: boolean;
}) => {
  const Component = isNested ? MenubarSubContent : MenubarContent;

  return (
    <Component>
      {items.map((item) => {
        if (Array.isArray(item.items)) {
          return isNested ? (
            <MenubarSub key={item.label}>
              <MenubarSubTrigger>{item.label}</MenubarSubTrigger>
              <MenuContent items={item.items} isNested />
            </MenubarSub>
          ) : (
            <MenuItem key={item.label} item={item} />
          );
        }
        return <MenuItem key={item.href} item={item} />;
      })}
    </Component>
  );
};

const MenuWide = () => (
  <div className="hidden sm:block">
    <Menubar>
      {MENU_ITEMS.map((item) => (
        <MenubarMenu key={item.label}>
          <MenubarTrigger>{item.label}</MenubarTrigger>
          <MenuContent items={item.items} />
        </MenubarMenu>
      ))}
    </Menubar>
  </div>
);

const MenuSmall = () => (
  <div className="sm:hidden">
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          <Menu size={24} />
        </MenubarTrigger>
        <MenubarContent>
          {MENU_ITEMS.map((item) => (
            <MenubarSub key={item.label}>
              <MenubarSubTrigger>{item.label}</MenubarSubTrigger>
              <MenuContent items={item.items} isNested />
            </MenubarSub>
          ))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>
);

export default MenuSmall;

export { MenuWide, MenuSmall };
