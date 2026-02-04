"use client";

import { useRouter } from "next/navigation";
import { ItemForm } from "@/components/ItemForm";
import { ItemTable } from "@/components/ItemTable";
import { ItemView } from "@/components/ItemView";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Item, CreateItemInput } from "@/types/item";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdjustmentOption {
  id: string;
  title: string;
}

interface ItemToolClientProps {
  initialItems: Item[];
  adjustments: AdjustmentOption[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ItemToolClient({
  initialItems,
  adjustments,
  searchParams,
}: ItemToolClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === Role.ADMIN ||
    session?.user?.role === Role.SUPERADMIN;

  const editId =
    typeof searchParams?.edit === "string" ? searchParams.edit : null;
  const viewId =
    typeof searchParams?.view === "string" ? searchParams.view : null;
  const isCreate =
    searchParams?.create === "1" || searchParams?.create === "true";
  const showArchived =
    searchParams?.archived === "1" || searchParams?.archived === "true";
  const archiveId =
    typeof searchParams?.archive === "string" ? searchParams.archive : null;

  const selectedItem =
    editId || viewId
      ? initialItems.find((i) => i.id === (editId || viewId))
      : null;

  const navigate = (params: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) search.set(k, v);
    });
    const qs = search.toString();
    router.push(`/admin/itemTool${qs ? `?${qs}` : ""}`);
  };

  const handleBack = () => {
    router.push("/admin/itemTool");
  };

  const handleSuccess = () => {
    router.push("/admin/itemTool");
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/items?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to archive");
      }
      toast({
        title: "Success",
        description: "Item archived successfully",
      });
      router.push("/admin/itemTool");
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to archive item",
        variant: "destructive",
      });
    }
  };

  const itemToArchive =
    archiveId ? initialItems.find((i) => i.id === archiveId) : null;

  const showForm = isCreate || (editId && selectedItem);
  const showView = viewId && selectedItem && !isCreate;
  const showList = !showForm && !showView;

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between bg-background">
        <h1 className="text-xl font-semibold">Item Tool</h1>
        {showList && (
          <Button
            onClick={() => navigate({ create: "1" })}
            disabled={!isAdmin}
          >
            Create New Item
          </Button>
        )}
        {(showForm || showView) && (
          <Button variant="outline" onClick={handleBack}>
            Back to List
          </Button>
        )}
      </div>

      <hr className="bg-foreground h-px" />

      {showList && (
        <>
          <ItemTable
            items={initialItems}
            onEdit={isAdmin ? (item) => navigate({ edit: item.id! }) : undefined}
            onView={(item) => navigate({ view: item.id! })}
            onArchive={
              isAdmin
                ? (id) => navigate({ archive: id, ...(showArchived ? { archived: "1" } : {}) })
                : undefined
            }
            showArchived={showArchived}
            onShowArchivedChange={(show) =>
              navigate(show ? { archived: "1" } : {})
            }
          />
        </>
      )}

      {showView && selectedItem && (
        <ItemView
          item={selectedItem}
          adjustmentTitle={
            selectedItem.data?.adjustmentId
              ? adjustments.find(
                  (a) => a.id === (selectedItem.data as { adjustmentId?: string })?.adjustmentId
                )?.title
              : undefined
          }
        />
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreate ? "Create New Item" : `Edit Item: ${selectedItem?.title}`}
            </CardTitle>
            <CardDescription>
              {isCreate
                ? "Create a new item with the form below"
                : "Edit the selected item properties"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ItemForm
              initialItem={selectedItem ?? null}
              adjustments={adjustments}
              onSubmit={async (values: CreateItemInput) => {
                const url = "/api/admin/items";
                const body = selectedItem
                  ? { ...values, id: selectedItem.id }
                  : values;
                const res = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.error ?? err.details ?? "Failed to save");
                }
                handleSuccess();
              }}
              onCancel={handleBack}
            />
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={!!itemToArchive}
        onOpenChange={(open) => {
          if (!open) navigate(showArchived ? { archived: "1" } : {});
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive item?</AlertDialogTitle>
            <AlertDialogDescription>
              Archive &ldquo;{itemToArchive?.title}&rdquo;? It will be hidden from
              event and item selection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToArchive?.id && handleArchive(itemToArchive.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
