"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { AdjustmentSourceType, Role } from "@prisma/client";
import { AdjustmentForm } from "@/components/AdjustmentForm";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Adjustment {
  id: string;
  title: string;
  description?: string | null;
  sourceType: AdjustmentSourceType;
  effectsJson: any;
  tags?: any;
  visibilityRoles?: Role[];
  archived: boolean;
}

const ROLE_SET = new Set<string>(Object.values(Role));

function normalizeVisibilityRoles(input: unknown): Role[] {
  if (!Array.isArray(input)) return [];
  const roles: Role[] = [];
  for (const v of input) {
    if (typeof v !== "string") continue;
    if (!ROLE_SET.has(v)) continue;
    roles.push(v as Role);
  }
  return roles;
}

const AdjustmentsPage = () => {
  const queryClient = useQueryClient();
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<Adjustment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === Role.ADMIN ||
    session?.user?.role === Role.SUPERADMIN;

  const { data: adjustments, isLoading } = useQuery<Adjustment[]>({
    queryKey: ["adjustments"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/adjustment");
      const raw = Array.isArray(response.data) ? response.data : [];
      return raw.map((a: any) => ({
        ...a,
        visibilityRoles: normalizeVisibilityRoles(a?.visibilityRoles),
      })) as Adjustment[];
    },
  });

  const handleCreate = useCallback(() => {
    setSelectedAdjustment(null);
    setIsCreating(true);
  }, []);

  const handleEdit = useCallback((adjustment: Adjustment) => {
    setSelectedAdjustment(adjustment);
    setIsCreating(false);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedAdjustment(null);
    setIsCreating(false);
  }, []);

  const handleSave = async (data: any) => {
    try {
      const payload = {
        ...data,
        id: selectedAdjustment?.id,
        archived: selectedAdjustment?.archived ?? false,
        visibilityRoles: normalizeVisibilityRoles(
          data.visibilityRoles ?? selectedAdjustment?.visibilityRoles ?? []
        ),
      };
      const response = await axios.post("/api/admin/adjustment", payload);

      toast({
        title: "Success",
        description: selectedAdjustment
          ? "Adjustment updated successfully"
          : "Adjustment created successfully",
      });

      setSelectedAdjustment(null);
      setIsCreating(false);
      await queryClient.invalidateQueries({ queryKey: ["adjustments"] });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data || error.message || "Failed to save adjustment";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleArchiveToggle = async (adjustment: Adjustment) => {
    try {
      await axios.patch("/api/admin/adjustment", {
        id: adjustment.id,
        archived: !adjustment.archived,
      });

      toast({
        title: "Success",
        description: adjustment.archived
          ? "Adjustment unarchived"
          : "Adjustment archived",
      });
      await queryClient.invalidateQueries({ queryKey: ["adjustments"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to update adjustment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between bg-background">
        <h1 className="text-xl font-semibold">Adjustment Management</h1>
        {!isCreating && !selectedAdjustment && (
          <Button onClick={handleCreate} disabled={!isAdmin}>
            Create New Adjustment
          </Button>
        )}
        {(isCreating || selectedAdjustment) && (
          <Button variant="outline" onClick={handleBack}>
            Back to List
          </Button>
        )}
      </div>

      <hr className="bg-foreground h-px" />

      {!isCreating && !selectedAdjustment ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Existing Adjustments</CardTitle>
            <CardDescription>
              Create, edit, or archive adjustments
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div>Loading adjustments...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adjustment</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments?.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell>
                        <div className="font-medium">{adjustment.title}</div>
                        {adjustment.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {adjustment.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {adjustment.sourceType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={adjustment.visibilityRoles?.length ? "secondary" : "outline"}>
                          {adjustment.visibilityRoles?.length ? "Admin" : "Public"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {adjustment.archived ? (
                          <Badge variant="outline">Archived</Badge>
                        ) : (
                          <Badge>Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(adjustment)}
                            disabled={!isAdmin}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={adjustment.archived ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => handleArchiveToggle(adjustment)}
                            disabled={!isAdmin}
                          >
                            {adjustment.archived ? "Unarchive" : "Archive"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedAdjustment ? "Edit Adjustment" : "Create Adjustment"}
            </CardTitle>
            <CardDescription>
              {selectedAdjustment
                ? "Update the selected adjustment"
                : "Create a new adjustment with the form below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdjustmentForm
              data={selectedAdjustment}
              onSubmit={handleSave}
              onCancel={handleBack}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdjustmentsPage;

