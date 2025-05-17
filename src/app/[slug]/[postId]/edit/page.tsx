import { EditPostEditor } from "@/components/EditPostEditor";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    postId: string;
    slug: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const post = await db.post.findFirst({
    where: {
      id: params.postId,
    },
  });

  if (!post) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      {/* heading */}
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            Currently editing post:
          </p>
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            {post.title}
          </h3>
        </div>
      </div>

      <EditPostEditor
        topicId={post.topicId}
        formId={params.postId}
        content={post.content}
        title={post.title}
      />

      <div className="w-full flex justify-end">
        <Button type="submit" className="w-full" form={params.postId}>
          Update
        </Button>
      </div>
    </div>
  );
};

export default Page;
