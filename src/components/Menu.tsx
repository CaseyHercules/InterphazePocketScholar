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

const MenuWide = () => {
  return (
    <div className="hidden sm:block">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Events</MenubarTrigger>
          <MenubarContent>
            <a href="/events/registration">
              <MenubarItem>Registration</MenubarItem>
            </a>
            <a href="/events/upcoming">
              <MenubarItem>Upcoming Events</MenubarItem>
            </a>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>New to Phaze</MenubarTrigger>
          <MenubarContent>
            <a href="/intro/new">
              <MenubarItem>Intro to Interphaze</MenubarItem>
            </a>
            <a href="/intro/conduct">
              <MenubarItem>Code of conduct</MenubarItem>
            </a>
            <a href="/intro/character">
              <MenubarItem>Character Creation</MenubarItem>
            </a>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Rules</MenubarTrigger>
          <MenubarContent>
            <a href="/rules/summary">
              <MenubarItem>Summary</MenubarItem>
            </a>
            <a href="/rules/advancement">
              <MenubarItem>Character Advancement</MenubarItem>
            </a>
            <MenubarSub>
              <MenubarSubTrigger>Classes</MenubarSubTrigger>
              <MenubarSubContent>
                <a href="/class/cleric">
                  <MenubarItem>Cleric</MenubarItem>
                </a>
                <a href="/class/druid">
                  <MenubarItem>Druid</MenubarItem>
                </a>
                <a href="/class/fighter">
                  <MenubarItem>Fighter</MenubarItem>
                </a>
                <a href="/class/monk">
                  <MenubarItem>Monk</MenubarItem>
                </a>
                <a href="/class/performer">
                  <MenubarItem>Performer</MenubarItem>
                </a>
                <a href="/class/psion">
                  <MenubarItem>Psion</MenubarItem>
                </a>
                <a href="/class/ranger">
                  <MenubarItem>Ranger</MenubarItem>
                </a>
                <a href="/class/rogue">
                  <MenubarItem>Rogue</MenubarItem>
                </a>
                <a href="/class/scholar">
                  <MenubarItem>Scholar</MenubarItem>
                </a>
                <a href="/class/shaman">
                  <MenubarItem>Shaman</MenubarItem>
                </a>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>Races</MenubarSubTrigger>
              <MenubarSubContent>
                <a href="/race/dwarf">
                  <MenubarItem>Dwarf</MenubarItem>
                </a>
                <a href="/race/elf">
                  <MenubarItem>Elf</MenubarItem>
                </a>
                <a href="/race/gnome">
                  <MenubarItem>Gnome</MenubarItem>
                </a>
                <a href="/race/half-elf">
                  <MenubarItem>Half Elf</MenubarItem>
                </a>
                <a href="/race/half-orc">
                  <MenubarItem>Half Orc</MenubarItem>
                </a>
                <a href="/race/halfling">
                  <MenubarItem>Halfling</MenubarItem>
                </a>
                <a href="/race/human">
                  <MenubarItem>Human</MenubarItem>
                </a>
                <a href="/race/kenogre">
                  <MenubarItem>Kenogre</MenubarItem>
                </a>
                <a href="/race/pumerre">
                  <MenubarItem>Pumerre</MenubarItem>
                </a>
              </MenubarSubContent>
            </MenubarSub>
            <a href="/rules/combat">
              <MenubarItem>STEP Combat</MenubarItem>
            </a>
            <a href="/rules/abilities">
              <MenubarItem>Character Abilities</MenubarItem>
            </a>
            <a href="/rules/items">
              <MenubarItem>Items</MenubarItem>
            </a>
            <a href="/rules/spellcasting">
              <MenubarItem>Spellcasting</MenubarItem>
            </a>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>World Info</MenubarTrigger>
          <MenubarContent>
            <a href="/world/inspiration">
              <MenubarItem>Inspiration</MenubarItem>
            </a>
            <a href="/world/geography">
              <MenubarItem>Geography</MenubarItem>
            </a>
            <a href="/world/history">
              <MenubarItem>History</MenubarItem>
            </a>
            <a href="/world/economy">
              <MenubarItem>Economy</MenubarItem>
            </a>
            <a href="/world/laws">
              <MenubarItem>Laws</MenubarItem>
            </a>
            <a href="/world/society">
              <MenubarItem>Society</MenubarItem>
            </a>
            <a href="/world/religion">
              <MenubarItem>Religion</MenubarItem>
            </a>
            <a href="/world/guilds">
              <MenubarItem>Guilds</MenubarItem>
            </a>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>About</MenubarTrigger>
          <MenubarContent>
            <a href="/about/us">
              <MenubarItem>Why Us</MenubarItem>
            </a>
            <a href="/about/team">
              <MenubarItem>Our Team</MenubarItem>
            </a>
            <a href="/about/contact">
              <MenubarItem>Contact us</MenubarItem>
            </a>
            <a href="/about/join">
              <MenubarItem>Join our Team</MenubarItem>
            </a>
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
                <a href="/events/registration">
                  <MenubarItem>Registation</MenubarItem>
                </a>
                <a href="/events/upcoming">
                  <MenubarItem>Upcoming Events</MenubarItem>
                </a>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>New to Phaze</MenubarSubTrigger>
              <MenubarSubContent>
                <a href="/intro/new">
                  <MenubarItem>Intro to Interphaze</MenubarItem>
                </a>
                <a href="/intro/conduct">
                  <MenubarItem>Code of conduct</MenubarItem>
                </a>
                <a href="/intro/character">
                  <MenubarItem>Character Creation</MenubarItem>
                </a>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>Rules</MenubarSubTrigger>
              <MenubarSubContent>
                <a href="/rules/summary">
                  <MenubarItem>Summary</MenubarItem>
                </a>
                <a href="/rules/advancement">
                  <MenubarItem>Character Advancement</MenubarItem>
                </a>
                <MenubarSub>
                  <MenubarSubTrigger>Classes</MenubarSubTrigger>
                  <MenubarSubContent>
                    <a href="/class/cleric">
                      <MenubarItem>Cleric</MenubarItem>
                    </a>
                    <a href="/class/druid">
                      <MenubarItem>Druid</MenubarItem>
                    </a>
                    <a href="/class/fighter">
                      <MenubarItem>Fighter</MenubarItem>
                    </a>
                    <a href="/class/monk">
                      <MenubarItem>Monk</MenubarItem>
                    </a>
                    <a href="/class/performer">
                      <MenubarItem>Performer</MenubarItem>
                    </a>
                    <a href="/class/psion">
                      <MenubarItem>Psion</MenubarItem>
                    </a>
                    <a href="/class/ranger">
                      <MenubarItem>Ranger</MenubarItem>
                    </a>
                    <a href="/class/rogue">
                      <MenubarItem>Rogue</MenubarItem>
                    </a>
                    <a href="/class/scholar">
                      <MenubarItem>Scholar</MenubarItem>
                    </a>
                    <a href="/class/shaman">
                      <MenubarItem>Shaman</MenubarItem>
                    </a>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSub>
                  <MenubarSubTrigger>Races</MenubarSubTrigger>
                  <MenubarSubContent>
                    <a href="/race/dwarf">
                      <MenubarItem>Dwarf</MenubarItem>
                    </a>
                    <a href="/race/elf">
                      <MenubarItem>Elf</MenubarItem>
                    </a>
                    <a href="/race/gnome">
                      <MenubarItem>Gnome</MenubarItem>
                    </a>
                    <a href="/race/half-elf">
                      <MenubarItem>Half Elf</MenubarItem>
                    </a>
                    <a href="/race/half-orc">
                      <MenubarItem>Half Orc</MenubarItem>
                    </a>
                    <a href="/race/halfling">
                      <MenubarItem>Halfling</MenubarItem>
                    </a>
                    <a href="/race/human">
                      <MenubarItem>Human</MenubarItem>
                    </a>
                    <a href="/race/kenogre">
                      <MenubarItem>Kenogre</MenubarItem>
                    </a>
                    <a href="/race/pumerre">
                      <MenubarItem>Pumerre</MenubarItem>
                    </a>
                  </MenubarSubContent>
                </MenubarSub>
                <a href="/rules/combat">
                  <MenubarItem>STEP Combat</MenubarItem>
                </a>
                <a href="/rules/abilities">
                  <MenubarItem>Character Abilities</MenubarItem>
                </a>
                <a href="/rules/items">
                  <MenubarItem>Items</MenubarItem>
                </a>
                <a href="/rules/spellcasting">
                  <MenubarItem>Spellcasting</MenubarItem>
                </a>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>World Info</MenubarSubTrigger>
              <MenubarSubContent>
                <a href="/world/inspiration">
                  <MenubarItem>Inspiration</MenubarItem>
                </a>
                <a href="/world/geography">
                  <MenubarItem>Geography</MenubarItem>
                </a>
                <a href="/world/history">
                  <MenubarItem>History</MenubarItem>
                </a>
                <a href="/world/economy">
                  <MenubarItem>Economy</MenubarItem>
                </a>
                <a href="/world/laws">
                  <MenubarItem>Laws</MenubarItem>
                </a>
                <a href="/world/society">
                  <MenubarItem>Society</MenubarItem>
                </a>
                <a href="/world/religion">
                  <MenubarItem>Religion</MenubarItem>
                </a>
                <a href="/world/guilds">
                  <MenubarItem>Guilds</MenubarItem>
                </a>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>About</MenubarSubTrigger>
              <MenubarSubContent>
                <a href="/about/us">
                  <MenubarItem>Why Us</MenubarItem>
                </a>
                <a href="/about/team">
                  <MenubarItem>Our Team</MenubarItem>
                </a>
                <a href="/about/contact">
                  <MenubarItem>Contact us</MenubarItem>
                </a>
                <a href="/about/join">
                  <MenubarItem>Join our Team</MenubarItem>
                </a>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

export default MenuSmall;

export { MenuWide, MenuSmall };
