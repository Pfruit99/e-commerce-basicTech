"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { RowActions } from "@/components/admin/row-actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { filterUsers } from "@/lib/admin";
import { roleLabels, userStatusLabels, type AdminUser, type UserRole } from "@/lib/mock-admin";

const dateFormat = new Intl.DateTimeFormat("es", { dateStyle: "medium", timeZone: "UTC" });
const roleItems = [
  { value: "all", label: "Todos los roles" },
  { value: "customer", label: roleLabels.customer },
  { value: "admin", label: roleLabels.admin },
];

/** Solo UI: las acciones no modifican a los usuarios. */
export function UsersTable({ users }: { users: AdminUser[] }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [notice, setNotice] = useState("");
  const visible = useMemo(() => filterUsers(users, query, role), [users, query, role]);
  const demo = (text: string) => () => setNotice(`Demostración: ${text}`);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o email" className="pl-9" aria-label="Buscar usuarios" />
        </div>
        <Select items={roleItems} value={role} onValueChange={(v) => v && setRole(v as UserRole | "all")}>
          <SelectTrigger className="w-52" aria-label="Filtrar por rol">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roleItems.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {visible.length} {visible.length === 1 ? "usuario" : "usuarios"}
        {notice && <span role="status"> · {notice}</span>}
      </p>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Alta</TableHead>
              <TableHead className="text-right">Pedidos</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>{roleLabels[u.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "outline" : "destructive"}>{userStatusLabels[u.status]}</Badge>
                  </TableCell>
                  <TableCell>{dateFormat.format(new Date(u.createdAt))}</TableCell>
                  <TableCell className="text-right">{u.orderCount}</TableCell>
                  <TableCell>
                    <RowActions
                      label={`Acciones de ${u.name}`}
                      actions={[
                        { label: "Ver perfil", onSelect: demo("el perfil aún no existe.") },
                        {
                          label: u.role === "admin" ? "Quitar rol de administrador" : "Hacer administrador",
                          onSelect: demo("no se cambió el rol."),
                        },
                        {
                          label: u.status === "active" ? "Bloquear" : "Desbloquear",
                          destructive: u.status === "active",
                          separated: true,
                          onSelect: demo("no se cambió el estado."),
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
