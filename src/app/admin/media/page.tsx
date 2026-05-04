import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/api-auth";

import AdminMediaClient from "./AdminMediaClient";

export default async function AdminMediaPage() {
  const session = await getAuthSession();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    redirect("/");
  }
  return <AdminMediaClient />;
}
