import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Interphaze Spell Cards",
  description: "Interphaze spell card printing queue",
};

export default function AdminPrintingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
