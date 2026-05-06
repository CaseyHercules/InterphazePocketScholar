import { db } from "@/lib/db";

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const decodedSlug = decodeURIComponent(slug);

  const topic = await db.topic.findFirst({
    where: {
      title: {
        equals: decodedSlug,
        mode: "insensitive",
      },
    },
  });

  if (!topic) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 h-full">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold">Topic not found</h2>
          <p className="text-zinc-500">
            The requested topic could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 h-full">
      {children}
    </div>
  );
};

export default Layout;
