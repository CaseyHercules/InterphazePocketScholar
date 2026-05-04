import { User } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full justify-center px-3 pb-10 pt-6 text-center sm:px-4 sm:pb-12 sm:pt-10 md:py-24 xl:py-32">
      <div className="mx-auto max-w-6xl space-y-6 pb-6 sm:space-y-8 md:pb-10">
        <h1 className="bg-gradient-to-r from-black to-orange-300 bg-clip-text py-2 text-2xl font-bold tracking-tighter text-transparent text-balance sm:text-4xl sm:leading-tight md:text-5xl xl:text-6xl">
          Welcome to the Lands of Interphaze
        </h1>
        <p className="mx-auto max-w-[34rem] text-pretty text-base leading-relaxed text-zinc-700 sm:text-lg md:text-xl md:leading-relaxed">
          One of a kind Family Friendly LARP vacation
        </p>
      </div>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="grid grid-flow-dense grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-3 rounded-lg p-3 text-center sm:space-y-4 sm:p-4">
            <div className="rounded-full bg-black/50 p-2">
              <User className="h-6 w-6 text-white sm:h-7 sm:w-7" aria-hidden />
            </div>
            <h2 className="text-lg font-bold text-balance sm:text-xl">
              Dynamic Player-Driven Storytelling
            </h2>
            <p className="max-w-prose text-left text-sm leading-relaxed text-zinc-800 sm:text-base md:text-center">
              Shape the destiny of Interphaze through your actions and
              decisions. The player-driven narrative ensures every weekend is an
              entirely distinct and captivating adventure, where your choices
              matter.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3 rounded-lg p-3 text-center sm:space-y-4 sm:p-4 md:col-span-2">
            <div className="rounded-full bg-black/50 p-2">
              <User className="h-6 w-6 text-white sm:h-7 sm:w-7" aria-hidden />
            </div>
            <h2 className="text-lg font-bold text-balance sm:text-xl">
              Unparalleled Creative Freedom
            </h2>
            <p className="max-w-prose text-left text-sm leading-relaxed text-zinc-800 sm:text-base md:text-center md:max-w-3xl">
              In Interphaze, the only limit is your imagination. Craft and
              embody your own unique character, from valiant heroes to enigmatic
              mages, and weave your own stories within this expansive, dynamic
              world.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3 rounded-lg p-3 text-center sm:space-y-4 sm:p-4">
            <div className="rounded-full bg-black/50 p-2">
              <User className="h-6 w-6 text-white sm:h-7 sm:w-7" aria-hidden />
            </div>
            <h2 className="text-lg font-bold text-balance sm:text-xl">
              Family-Friendly and RPG Player-Focused
            </h2>
            <p className="max-w-prose text-left text-sm leading-relaxed text-zinc-800 sm:text-base md:text-center">
              Designed for families and attendees of Renaissance Faires and RPG
              players alike, our LARP offers a safe, inclusive, and educational
              experience that caters to different age groups, interests, and
              experience levels.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3 rounded-lg p-3 text-center sm:space-y-4 sm:p-4">
            <div className="rounded-full bg-black/50 p-2">
              <User className="h-6 w-6 text-white sm:h-7 sm:w-7" aria-hidden />
            </div>
            <h2 className="text-lg font-bold text-balance sm:text-xl">
              Approachable Combat and Unique Spellcasting
            </h2>
            <p className="max-w-prose text-left text-sm leading-relaxed text-zinc-800 sm:text-base md:text-center">
              Experience a one-of-a-kind combat system that&apos;s approachable
              yet strategic. Plus, dive into spellcasting with a customizable
              system, crafting your own spells to shape your character&apos;s
              magical abilities.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3 rounded-lg p-3 text-center sm:space-y-4 sm:p-4">
            <div className="rounded-full bg-black/50 p-2">
              <User className="h-6 w-6 text-white sm:h-7 sm:w-7" aria-hidden />
            </div>
            <h2 className="text-lg font-bold text-balance sm:text-xl">
              Costuming and Props Customization
            </h2>
            <p className="max-w-prose text-left text-sm leading-relaxed text-zinc-800 sm:text-base md:text-center">
              Bring your own costume and props to showcase your creativity, and
              enhance your character&apos;s appearance. For added convenience,
              select items are available on-site, making the experience
              accessible to all.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
