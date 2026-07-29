"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Category,
  createProperty,
  deleteProperty,
  getCategories,
  getMyProperties,
  Property,
  updateProperty,
} from "../../../lib/api";

const emptyForm = {
  title: "",
  description: "",
  location: "",
  address: "",
  rentAmount: "",
  categoryId: "",
  bedrooms: "",
  bathrooms: "",
  areaSqft: "",
  amenities: "",
  images: "",
};

const money = (value: number | string) => `৳${Number(value).toLocaleString()}`;

export default function Page() {
  const [items, setItems] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmingProperty, setConfirmingProperty] = useState<Property | null>(null);

  const load = () =>
    getMyProperties()
      .then((result) => setItems(result.data || []))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load properties"));

  useEffect(() => {
    load();
    getCategories().then((result) => setCategories(result.data || [])).catch(() => undefined);
  }, []);

  const setField = (field: keyof typeof emptyForm, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const edit = (property: Property) => {
    setEditingId(property.id);
    setDrawerOpen(true);
    setForm({
      title: property.title || "",
      description: property.description || "",
      location: property.location || "",
      address: property.address || "",
      rentAmount: String(property.rentAmount ?? ""),
      categoryId: property.category?.id || "",
      bedrooms: property.bedrooms == null ? "" : String(property.bedrooms),
      bathrooms: property.bathrooms == null ? "" : String(property.bathrooms),
      areaSqft: property.areaSqft == null ? "" : String(property.areaSqft),
      amenities: (property.amenities || []).join(", "),
      images: (property.images || []).join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); setDrawerOpen(false); };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(""); setMessage("");
    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      address: form.address || undefined,
      rentAmount: Number(form.rentAmount),
      categoryId: form.categoryId,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      areaSqft: form.areaSqft ? Number(form.areaSqft) : undefined,
      amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
      images: form.images.split(",").map((item) => item.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await updateProperty(editingId, payload);
        setMessage("Property updated successfully.");
      } else {
        await createProperty({ ...payload, status: "AVAILABLE" });
        setMessage("Property created successfully.");
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${editingId ? "update" : "create"} property`);
    }
  };

  const remove = async (id: string) => {
    setError(""); setMessage(""); setRemovingId(id);
    try { await deleteProperty(id); setConfirmingProperty(null); setMessage("Property removed successfully."); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to remove property"); }
    finally { setRemovingId(null); }
  };

  return <div>
    <div className="resource-head"><div><p className="eyebrow">Property management</p><h1>My properties</h1></div><button className="button" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setDrawerOpen(true); }}>+ Add property</button></div>
    {drawerOpen && <div className="drawer-backdrop" onClick={(event) => { if (event.target === event.currentTarget) cancelEdit(); }}><aside className="property-drawer panel">
      <div className="drawer-head"><h2>{editingId ? "Edit property" : "Add property"}</h2><button type="button" className="drawer-close" onClick={cancelEdit} aria-label="Close">×</button></div>
      <form onSubmit={submit}>
      <input required placeholder="Title" value={form.title} onChange={(event) => setField("title", event.target.value)} />
      <textarea required placeholder="Description" value={form.description} onChange={(event) => setField("description", event.target.value)} />
      <input required placeholder="Location" value={form.location} onChange={(event) => setField("location", event.target.value)} />
      <input placeholder="Full address" value={form.address} onChange={(event) => setField("address", event.target.value)} />
      <input required type="number" min="0" placeholder="Monthly rent" value={form.rentAmount} onChange={(event) => setField("rentAmount", event.target.value)} />
      <select required value={form.categoryId} onChange={(event) => setField("categoryId", event.target.value)}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
      <input type="number" min="0" placeholder="Bedrooms" value={form.bedrooms} onChange={(event) => setField("bedrooms", event.target.value)} />
      <input type="number" min="0" placeholder="Bathrooms" value={form.bathrooms} onChange={(event) => setField("bathrooms", event.target.value)} />
      <input type="number" min="0" placeholder="Area (sq ft)" value={form.areaSqft} onChange={(event) => setField("areaSqft", event.target.value)} />
      <input placeholder="Amenities comma separated" value={form.amenities} onChange={(event) => setField("amenities", event.target.value)} />
      <input placeholder="Image URLs comma separated" value={form.images} onChange={(event) => setField("images", event.target.value)} />
      <button className="button">{editingId ? "Update property" : "Create property"}</button>
      {editingId && <button type="button" className="button button-ghost" onClick={cancelEdit}>Cancel edit</button>}
      {message && <p className="success-message">{message}</p>}{error && <p className="form-error">{error}</p>}
      </form>
    </aside></div>}
    {confirmingProperty && <div className="confirmation-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setConfirmingProperty(null); }}><div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="remove-property-title"><div className="confirmation-icon"><AlertTriangle size={23} /></div><h2 id="remove-property-title">Remove property?</h2><p><strong>{confirmingProperty.title}</strong> will be removed from your property list. You can’t undo this action.</p><div className="confirmation-actions"><button type="button" className="button button-ghost" onClick={() => setConfirmingProperty(null)}>Keep property</button><button type="button" className="danger-confirm-button" disabled={removingId === confirmingProperty.id} onClick={() => remove(confirmingProperty.id)}>{removingId === confirmingProperty.id ? "Removing…" : "Yes, remove it"}</button></div></div></div>}
    {message && <p className="success-message">{message}</p>}{error && <p className="form-error">{error}</p>}<div className="panel table-panel"><table className="data-table"><thead><tr><th>Property</th><th>Address / Location</th><th>Details</th><th>Rent</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map((property) => <tr key={property.id}><td><b>{property.title}</b><br /><small>{property.description}</small></td><td>{property.address || "—"}<br /><span className="muted">{property.location}</span></td><td>{property.bedrooms ?? "—"} bed · {property.bathrooms ?? "—"} bath<br />{property.areaSqft ? `${property.areaSqft} sq ft` : "—"}</td><td>{money(property.rentAmount)}</td><td><span className={`property-status ${property.status.toLowerCase()}`}>{property.status}</span></td><td><button type="button" className="text-button" onClick={() => edit(property)}>Edit</button><button type="button" className="danger-button property-remove-button" disabled={removingId === property.id} onClick={() => setConfirmingProperty(property)}>{removingId === property.id ? "Removing…" : "Remove"}</button></td></tr>)}</tbody></table></div>
  </div>;
}
