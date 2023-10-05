import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

import { Menu } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

const MenuWide = () => {
  return (
    <div className="hidden sm:block">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Events</MenubarTrigger>
          <MenubarContent>
            <Link href="/Registration">
              <MenubarItem>Registration</MenubarItem>
            </Link>
            <Link href="/Events">
              <MenubarItem>Upcoming Events</MenubarItem>
            </Link>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>New to Phaze</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Intro to Interphaze</MenubarItem>
            <MenubarItem>Code of conduct</MenubarItem>
            <MenubarItem>Character Creation</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Rules</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Summary</MenubarItem>
            <MenubarItem>Character Advancement</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Classes</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Cleric</MenubarItem>
                <MenubarItem>Druid</MenubarItem>
                <MenubarItem>Fighter</MenubarItem>
                <MenubarItem>Monk</MenubarItem>
                <MenubarItem>Performer</MenubarItem>
                <MenubarItem>Psion</MenubarItem>
                <MenubarItem>Ranger</MenubarItem>
                <MenubarItem>Rogue</MenubarItem>
                <MenubarItem>Scholar</MenubarItem>
                <MenubarItem>Shaman</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>Races</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Dwarf</MenubarItem>
                <MenubarItem>Elf</MenubarItem>
                <MenubarItem>Gnome</MenubarItem>
                <MenubarItem>Half Elf</MenubarItem>
                <MenubarItem>Half Orc</MenubarItem>
                <MenubarItem>Halfling</MenubarItem>
                <MenubarItem>Human</MenubarItem>
                <MenubarItem>Kenogre</MenubarItem>
                <MenubarItem>Pumerre</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarItem>STEP Combat</MenubarItem>
            <MenubarItem>Character Abilities</MenubarItem>
            <MenubarItem>Items</MenubarItem>
            <MenubarItem>Spell Casting</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>World Info</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Inspiration</MenubarItem>
            <MenubarItem>Geography</MenubarItem>
            <MenubarItem>History</MenubarItem>
            <MenubarItem>Economy</MenubarItem>
            <MenubarItem>Laws</MenubarItem>
            <MenubarItem>Seciety</MenubarItem>
            <MenubarItem>Religion</MenubarItem>
            <MenubarItem>Guilds</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>About</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Why Us</MenubarItem>
            <MenubarItem>Our Team</MenubarItem>
            <MenubarItem>Contact us</MenubarItem>
            <MenubarItem>Join our Team</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

const MenuSmall = () => {
  return (
    <div className="sm:hidden">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>
            <Menu size={24} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Events</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Registation</MenubarItem>
                <MenubarItem>Upcoming Events</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>New to Phaze</MenubarSubTrigger>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>Rules</MenubarSubTrigger>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>World Info</MenubarSubTrigger>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>About</MenubarSubTrigger>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

export default MenuSmall;

export { MenuWide, MenuSmall };
