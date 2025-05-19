"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ArrowLeft } from "lucide-react";
import "quill/dist/quill.snow.css";
import "@/styles/quill.css";
import type Quill from "quill";

type BackstoryEditorProps = {
  characterId: string;
  initialContent: string | null;
};

export function BackstoryEditor({
  characterId,
  initialContent,
}: BackstoryEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const quillRef = useRef<Quill>();
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize Quill editor
  const initializeEditor = useCallback(async () => {
    if (!editorRef.current) return;

    const { default: Quill } = await import("quill");

    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link"],
      ["clean"],
    ];

    const quill = new Quill(editorRef.current, {
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder: "Write your character's backstory...",
      theme: "snow",
    });

    // Set initial content if available
    if (initialContent) {
      try {
        const content = JSON.parse(initialContent);
        quill.setContents(content);
      } catch (error) {
        // If parsing fails, try treating it as plain text
        quill.setText(initialContent);
      }
    }

    quillRef.current = quill;
  }, [initialContent]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      initializeEditor();
    }
  }, [isMounted, initializeEditor]);

  const handleSave = async () => {
    if (!quillRef.current) return;

    setIsPending(true);
    try {
      // Get content from Quill editor
      const quillContent = quillRef.current.getContents();
      const backstoryContent = JSON.stringify(quillContent);

      // Update character backstory using fetch
      const response = await fetch(`/api/characters/${characterId}/backstory`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ backstory: backstoryContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to update backstory");
      }

      toast({
        title: "Backstory updated",
        description: "Your character's backstory has been saved.",
      });

      // Navigate back to the character passport
      router.push(`/passport/${characterId}`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Something went wrong",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  if (!isMounted) {
    return (
      <Card className="p-6">
        <div className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardContent className="p-0 pb-6">
        <div className="quill-container">
          <div ref={editorRef} className="min-h-[300px]" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save Backstory
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
