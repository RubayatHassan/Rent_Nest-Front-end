import { DashboardShell } from "../../components/DashboardShell";
import { RoleGate } from "../../components/RoleGate";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate role="ADMIN">
      <DashboardShell role="ADMIN" title="Admin dashboard">
        {children}
      </DashboardShell>
    </RoleGate>
  );
}
