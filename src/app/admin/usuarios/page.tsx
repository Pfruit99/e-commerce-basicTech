import { PageHeader } from "@/components/admin/page-header";
import { UsersTable } from "@/components/admin/users-table";
import { adminUsers } from "@/lib/mock-admin";

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader title="Usuarios" description="Clientes y administradores registrados." />
      <UsersTable users={adminUsers} />
    </>
  );
}
