import { redirect } from "next/navigation";

export default function SpellToolReviewRedirect() {
  redirect("/admin/spellTool?view=review");
}
