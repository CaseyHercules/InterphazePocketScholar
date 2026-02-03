"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRecord {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  image: string | null;
  UnallocatedLevels: number;
  UnrequestedSkills: number;
  role: Role;
}

const ROLES: Role[] = [
  Role.USER,
  Role.ADMIN,
  Role.SUPERADMIN,
  Role.SPELLWRIGHT,
  Role.MODERATOR,
];

function UserEditPopover({
  user,
  open,
  canEditRole,
  onSave,
  onClose,
}: {
  user: UserRecord;
  open: boolean;
  canEditRole: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [unallocatedLevels, setUnallocatedLevels] = useState(
    String(user.UnallocatedLevels)
  );
  const [unrequestedSkills, setUnrequestedSkills] = useState(
    String(user.UnrequestedSkills)
  );
  const [role, setRole] = useState<Role>(user.role);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setUsername(user.username ?? "");
      setUnallocatedLevels(String(user.UnallocatedLevels));
      setUnrequestedSkills(String(user.UnrequestedSkills));
      setRole(user.role);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        id: user.id,
        name: name.trim() || null,
        email: email.trim() || null,
        username: username.trim() || null,
        UnallocatedLevels: Number(unallocatedLevels) || 0,
        UnrequestedSkills: Number(unrequestedSkills) || 0,
      };
      if (canEditRole) {
        payload.role = role;
      }
      await axios.patch("/api/admin/user", payload);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      onSave();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to update user";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="unallocated">Unallocated Levels</Label>
        <Input
          id="unallocated"
          type="number"
          min={0}
          value={unallocatedLevels}
          onChange={(e) => setUnallocatedLevels(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="unrequested">Unrequested Skills</Label>
        <Input
          id="unrequested"
          type="number"
          min={0}
          value={unrequestedSkills}
          onChange={(e) => setUnrequestedSkills(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(v) => setRole(v as Role)}
          disabled={!canEditRole}
        >
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === Role.ADMIN ||
    session?.user?.role === Role.SUPERADMIN;
  const canEditRole = session?.user?.role === Role.SUPERADMIN;

  const { data: users, isLoading } = useQuery<UserRecord[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/user");
      return res.data;
    },
    enabled: !!session,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  }, [queryClient]);

  if (!session) {
    return (
      <div className="w-full p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-full p-6">
        <p className="text-destructive">Unauthorized</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">User Management</h1>
        <p className="text-sm text-muted-foreground">
          View and edit registered users. Only SUPERADMIN can change roles.
        </p>
      </div>

      <hr className="bg-foreground h-px" />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Click Edit to modify user data in a popover
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div>Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    canEditRole={canEditRole}
                    onSave={invalidate}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserRow({
  user,
  canEditRole,
  onSave,
}: {
  user: UserRecord;
  canEditRole: boolean;
  onSave: () => void;
}) {
  const [open, setOpen] = useState(false);

  const displayName =
    user.name || user.username || user.email || "(no name)";

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{displayName}</div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {user.email ?? "—"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {user.username ?? "—"}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{user.role}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="mb-3">
              <h3 className="font-medium">Edit user</h3>
              <p className="text-sm text-muted-foreground">{displayName}</p>
            </div>
            <UserEditPopover
              user={user}
              open={open}
              canEditRole={canEditRole}
              onSave={onSave}
              onClose={() => setOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </TableCell>
    </TableRow>
  );
}
