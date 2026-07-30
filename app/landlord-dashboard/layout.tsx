import { DashboardShell } from "../../components/DashboardShell";
import { RoleGate } from "../../components/RoleGate";
export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate role="LANDLORD">
      <DashboardShell role="LANDLORD" title="Landlord dashboard">
        {children}
      </DashboardShell>
    </RoleGate>
  );
}
