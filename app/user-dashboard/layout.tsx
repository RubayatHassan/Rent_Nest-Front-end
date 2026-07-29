import { DashboardShell } from "../../components/DashboardShell"; import { RoleGate } from "../../components/RoleGate";
export default function UserLayout({children}:{children:React.ReactNode}){return <RoleGate role="TENANT"><DashboardShell role="TENANT" title="My dashboard">{children}</DashboardShell></RoleGate>}
