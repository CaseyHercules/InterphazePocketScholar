import { User } from "lucide-react";

export default function Home() {
  return (
    // <div className="col flex-col w-full content-center justify-between">
    //   <p className="text-4xl font-extrabold text-center pt-5">
    //     Welcome to the Lands of Interphaze
    //   </p>

    // </div>
    <div className="w-full justify-center text-center py-12 md:py-24 xl:py-32 ">
      <div className="space-y-2 pb-6 md:pb-10">
        <h1 className="text-3xl font-bold py-2 tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-black to-orange-300">
          Welcome to the Lands of Interphaze
        </h1>
        <p className="max-w-[600px] md:text-xl mx-auto">
          One of a kind Family Friendly LARP vacation
        </p>
      </div>
      <div className="w-full max-w-full space-y-4 mx-auto">
        <div className="grid grid-col-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-flow-dense">
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg">
            <div className="p-2 bg-black bg-opacity-50 rounded-full">
              <User />
            </div>
            <h2 className="text-xl font-bold">
              Dynamic Player-Driven Storytelling
            </h2>
            <p>
              Shape the destiny of Interphaze through your actions and
              decisions. The player-driven narrative ensures every weekend is an
              entirely distinct and captivating adventure, where your choices
              matter.
            </p>
          </div>
          <div className="flex flex-col md:col-span-2 items-center space-y-2 p-4 rounded-lg">
            <div className="p-2 bg-black bg-opacity-50 rounded-full">
              <User />
            </div>
            <h2 className="text-xl font-bold">Unparalleled Creative Freedom</h2>
            <p>
              In Interphaze, the only limit is your imagination. Craft and
              embody your own unique character, from valiant heroes to enigmatic
              mages, and weave your own stories within this expansive, dynamic
              world.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg">
            <div className="p-2 bg-black bg-opacity-50 rounded-full">
              <User />
            </div>
            <h2 className="text-xl font-bold">
              Family-Friendly and RPG Player-Focused
            </h2>
            <p>
              Designed for families and attendees of Renaissance Faires and RPG
              players alike, our LARP offers a safe, inclusive, and educational
              experience that caters to different age groups, interests, and
              experience levels.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg">
            <div className="p-2 bg-black bg-opacity-50 rounded-full">
              <User />
            </div>
            <h2 className="text-xl font-bold">
              Approachable Combat and Unique Spellcasting
            </h2>
            <p>
              Experience a one-of-a-kind combat system that's approachable yet
              strategic. Plus, dive into spellcasting with a customizable
              system, crafting your own spells to shape your character's magical
              abilities.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg">
            <div className="p-2 bg-black bg-opacity-50 rounded-full">
              <User />
            </div>
            <h2 className="text-xl font-bold">
              Costuming and Props Customization
            </h2>
            <p>
              Bring your own costume and props to showcase your creativity, and
              enhance your character's appearance. For added convenience, select
              items are available on-site, making the experience accessible to
              all.
            </p>
          </div>
        </div>
      </div>
    </div>
    // <div className="w-full justify-center text-center py-12 md:py-24 xl:py-32 ">
    //   <div className="space-y-2">
    //     <h1 className="text-3xl font-bold py-2  tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-black to-orange-300">
    //       Welcome to the Lands of Interphaze
    //     </h1>
    //     <p className="max-w-[600px] md:text-xl mx-auto">
    //       One of a kind Family Friendly LARP vacation
    //     </p>
    //   </div>
    //   <div className="w-full max-w-full space-y-4 mx-auto">
    //     <div className="grid grid-col-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-flow-dense">
    //       <div className="flex flex-col row-span-2 items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //       <div className="flex flex-col col-span-2 items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //       <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //       <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //       <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //       <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //       <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //       <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //       <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //       <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //       <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //       <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-red-500">
    //         <User />
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}
