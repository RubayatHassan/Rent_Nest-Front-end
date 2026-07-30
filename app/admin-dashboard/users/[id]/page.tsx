"use client";
import { useParams } from "next/navigation";
import { ResourcePage } from "../../../../components/ResourcePage";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return (
    <ResourcePage
      title="User details"
      eyebrow="User management"
      endpoint={`/admin/users/${id}`}
      mapRows="profileRows"
    />
  );
}
