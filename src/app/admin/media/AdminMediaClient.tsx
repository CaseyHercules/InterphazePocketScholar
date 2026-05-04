"use client";

import { UploadButton } from "@uploadthing/react";
import { useRouter } from "next/navigation";

import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import "@uploadthing/react/styles.css";

export default function AdminMediaClient() {
  const router = useRouter();

  return (
    <div className="w-full max-w-2xl space-y-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Site media</h1>
        <p className="text-sm text-muted-foreground">
          Upload images to UploadThing. Home gallery and full-page background are
          stored in the database and used on the public site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Home gallery</CardTitle>
          <CardDescription>
            Adds a published image to the home page gallery (order follows upload
            sequence). Configure UploadThing for this app in the dashboard and
            set the server env token on Vercel (or your host) so uploads resolve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadButton<OurFileRouter, "homeGalleryImage">
            endpoint="homeGalleryImage"
            onClientUploadComplete={() => {
              toast({ title: "Gallery image added" });
              router.refresh();
            }}
            onUploadError={(e) => {
              toast({
                title: "Upload failed",
                description: e.message,
                variant: "destructive",
              });
            }}
            appearance={{
              button: "ut-ready:bg-stone-800 ut-uploading:cursor-not-allowed",
              allowedContent: "ut-uploading:opacity-50",
            }}
            content={{
              button: ({ ready }) => (ready ? "Upload photo" : "Preparing…"),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Page background</CardTitle>
          <CardDescription>
            Replaces the fixed full-page map watermark (behind the cream
            panel). Large images work best; the previous background upload is
            removed when you upload a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <UploadButton<OurFileRouter, "pageBackgroundImage">
            endpoint="pageBackgroundImage"
            onClientUploadComplete={() => {
              toast({ title: "Background updated" });
              router.refresh();
            }}
            onUploadError={(e) => {
              toast({
                title: "Upload failed",
                description: e.message,
                variant: "destructive",
              });
            }}
            appearance={{
              button: "ut-ready:bg-stone-800 ut-uploading:cursor-not-allowed",
              allowedContent: "ut-uploading:opacity-50",
            }}
            content={{
              button: ({ ready }) => (ready ? "Upload background" : "Preparing…"),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
