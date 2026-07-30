"use client";
import { useParams } from "next/navigation";
import { ResourcePage } from "../../../../../components/ResourcePage";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return (
    <ResourcePage
      title="Edit category"
      eyebrow="Content management"
      endpoint={`/admin/categories/${id}`}
      mapRows="categoryRows"
    />
  );
}
