"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Category, createCategory, getAdminCategories, updateCategory } from "../../../lib/api";

export default function Page() {
  const [items, setItems] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = () => getAdminCategories().then((result) => setItems(result.data || [])).catch((err) => setError(err instanceof Error ? err.message : "Unable to load categories"));

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(""), 3500);
    return () => window.clearTimeout(timer);
  }, [success]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setName("");
    setDescription("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateCategory(editingId, { name: name.trim(), description: description.trim() || undefined });
      } else {
        await createCategory({ name: name.trim(), description: description.trim() || undefined });
      }
      closeDrawer();
      setSuccess(editingId ? "Category updated successfully." : "Category created successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${editingId ? "update" : "create"} category`);
    }
  };

  const filtered = items.filter((category) => `${category.name} ${category.description || ""}`.toLowerCase().includes(query.toLowerCase()));

  return <div>
    {success && <div className="success-toast" role="status"><span className="success-toast-icon"><Check size={16} /></span><div><strong>Success</strong><p>{success}</p></div><button type="button" aria-label="Dismiss notification" onClick={() => setSuccess("")}><X size={16} /></button></div>}
    <div className="resource-head"><div><p className="eyebrow">Content management</p><h1>Categories</h1></div><button className="button" type="button" onClick={() => { setError(""); setEditingId(null); setName(""); setDescription(""); setDrawerOpen(true); }}>+ Create category</button></div>
    {drawerOpen && <div className="drawer-backdrop" onClick={(event) => { if (event.target === event.currentTarget) closeDrawer(); }}><aside className="property-drawer panel category-drawer"><div className="drawer-head"><h2>{editingId ? "Edit category" : "Create category"}</h2><button type="button" className="drawer-close" onClick={closeDrawer} aria-label="Close">×</button></div><div className="category-form-head"><div className="category-form-icon">⌂</div><div><p className="eyebrow">Organize your marketplace</p><p className="drawer-description">{editingId ? "Update this category for your marketplace." : "Add a clear category so renters can find the right property faster."}</p></div></div><form onSubmit={submit}><label htmlFor="category-name">Category name</label><input id="category-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Apartments, Studios" /><label htmlFor="category-description">Description <span>(optional)</span></label><textarea id="category-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a short description for this category" rows={4} /><button className="button category-submit">{editingId ? "Update category →" : "Create category →"}</button>{error && <p className="form-error">{error}</p>}</form></aside></div>}
    {error && !drawerOpen && <p className="form-error">{error}</p>}
    <div className="panel table-panel category-list"><div className="panel-head"><div><p className="eyebrow">Your categories</p><h2>Existing categories</h2></div><span className="badge">{filtered.length} total</span></div><div className="table-tools"><div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories..." /></div></div><table className="data-table"><thead><tr><th>Name</th><th>Description</th><th>Properties</th><th>Action</th></tr></thead><tbody>{filtered.map((category) => <tr key={category.id}><td><b>{category.name}</b></td><td>{category.description || "No description"}</td><td><span className="badge">{category._count?.properties || 0}</span></td><td><button className="text-button" type="button" onClick={() => { setEditingId(category.id); setName(category.name); setDescription(category.description || ""); setError(""); setDrawerOpen(true); }}>Edit</button></td></tr>)}</tbody></table></div>
  </div>;
}
