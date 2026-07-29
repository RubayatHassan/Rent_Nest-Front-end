"use client";

import { FormEvent, useEffect, useState } from "react";
import { createCategory, getAdminCategories, Category } from "../../../../lib/api";

export default function Page() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => getAdminCategories().then((result) => setItems(result.data || [])).catch((err) => setError(err instanceof Error ? err.message : "Unable to load categories"));

  useEffect(() => { load(); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await createCategory({ name: name.trim(), description: description.trim() || undefined });
      setName("");
      setDescription("");
      setSuccess("Category created successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create category");
    } finally {
      setSaving(false);
    }
  };

  return <div>
    <div className="resource-head"><div><p className="eyebrow">Content management</p><h1>Create category</h1></div></div>
    <form className="panel category-form" onSubmit={submit}>
      <div className="category-form-head"><div className="category-form-icon">⌂</div><div><p className="eyebrow">Organize your marketplace</p><h2>Add a new category</h2><p>Create a clear category so renters can find the right property faster.</p></div></div>
      <label htmlFor="category-name">Category name</label>
      <input id="category-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Apartments, Studios" required />
      <label htmlFor="category-description">Description <span>(optional)</span></label>
      <textarea id="category-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a short description for this category" rows={4} />
      <button className="button category-submit" disabled={saving}>{saving ? "Creating…" : "Create category →"}</button>
      {success && <p className="success-message">{success}</p>}
      {error && <p className="form-error">{error}</p>}
    </form>
    <div className="panel table-panel category-list"><div className="panel-head"><div><p className="eyebrow">Your categories</p><h2>Existing categories</h2></div><span className="badge">{items.length} total</span></div><table className="data-table"><thead><tr><th>Name</th><th>Description</th><th>Properties</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><b>{item.name}</b></td><td>{item.description || "No description"}</td><td><span className="badge">{item._count?.properties || 0}</span></td></tr>)}</tbody></table></div>
  </div>;
}
