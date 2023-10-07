import { Editor } from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface pageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: pageProps) => {
  const topic = await db.topic.findFirst({
    where: {
      title: params.slug,
    },
  });

  if (!topic) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      {/* heading */}
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Create Post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            in c/{params.slug}
          </p>
        </div>
      </div>

      <Editor topicId={topic.id} />

      <div className="w-full flex justify-end">
        <Button type="submit" className="w-full" form="topic-post-form">
          Post
        </Button>
      </div>
    </div>
  );
};

export default page;
