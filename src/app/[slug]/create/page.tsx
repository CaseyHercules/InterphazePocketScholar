import { Editor } from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface pageProps {
  params: {
    slug: string;
  };
}

const formId = "topic-post-form";

const page = async ({ params }: pageProps) => {
  const { slug } = params;
  const topic = await db.topic.findFirst({
    where: {
      title: slug,
    },
  });

  if (!topic) return notFound();

  return (
    <div className="col-span-1 md:col-span-3 md:row-start-1 flex flex-col items-start gap-6">
      {/* heading */}
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Create Post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            in {params.slug}
          </p>
        </div>
      </div>

      <Editor topicId={topic.id} formId={formId} />

      <div className="w-full flex justify-end">
        <Button type="submit" className="w-full" form={formId}>
          Post
        </Button>
      </div>
    </div>
  );
};

export default page;
