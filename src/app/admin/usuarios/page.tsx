import { PageHeader } from "@/components/admin/page-header";
import { UsersTable } from "@/components/admin/users-table";
import { adminUsers } from "@/lib/mock-admin";
import { requirePageAccess } from "@/lib/server/session";

export default async function AdminUsersPage() {
  // El layout también comprueba, pero Next renderiza la página por separado: sin esto su contenido se filtraría.
  await requirePageAccess("admin", "/admin/usuarios");
  return (
    <>
      <PageHeader title="Usuarios" description="Clientes y administradores registrados." />
      <UsersTable users={adminUsers} />
    </>
  );
}
