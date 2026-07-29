"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { deleteMyAccount, deleteMyProfilePhoto, getMyProfile, updateMyProfile, User } from "../lib/api";
import { useRouter } from "next/navigation";

export function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [form, setForm] = useState({ phone: "", address: "", profilePhoto: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleting, setDeleting] = useState(false);

  const loadProfile = async () => {
    try {
      const user = await getMyProfile();
      setProfile(user);
      setForm({ phone: (user.phone || "").replace(/\D/g, "").slice(0, 11), address: user.address || "", profilePhoto: user.profilePhoto || "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value.trim())) as { phone?: string; address?: string; profilePhoto?: string };
    if (!Object.keys(payload).length) {
      setError("Please fill in at least one field to update."); setSaving(false); return;
    }
    try {
      const updated = await updateMyProfile(payload);
      setProfile(updated); setForm({ phone: "", address: "", profilePhoto: "" }); setMessage("Profile updated successfully.");
      window.setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update your profile");
    } finally { setSaving(false); }
  };

  const removePhoto = async () => {
    setError(""); setMessage("");
    try {
      const updated = await deleteMyProfilePhoto();
      setProfile(updated); setForm({ ...form, profilePhoto: "" }); setMessage("Profile photo removed.");
      window.setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove profile photo");
    }
  };

  const removeAccount = async () => {
    setError(""); setDeleting(true);
    try { await deleteMyAccount(); router.replace("/"); router.refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to deactivate your account"); setDeleting(false); }
  };

  if (loading) return <div className="loading-state">Loading your profile…</div>;
  if (!profile) return <p className="form-error">{error || "Unable to load your profile"}</p>;

  return <>
    <div className="resource-head"><div><p className="eyebrow">Account settings</p><h1>Profile</h1></div></div>
    {message && <div className="success-toast"><div><strong>Done</strong><p>{message}</p></div></div>}
    {error && <p className="form-error">{error}</p>}
    <div className="profile-layout">
      <section className="panel profile-summary">
        <div className="profile-photo-row"><div className="profile-avatar">{profile.profilePhoto ? <img src={profile.profilePhoto} alt="Profile" /> : profile.name.charAt(0).toUpperCase()}</div>{profile.profilePhoto && <button type="button" className="text-button" onClick={removePhoto}>Remove photo</button>}</div>
        <h2>{profile.name}</h2><p className="muted">{profile.email}</p><span className="badge">{profile.role}</span>
      </section>
      <form className="panel profile-form" onSubmit={submit}>
        <h2>Update your information</h2>
        <p className="field-hint profile-form-note">Name is fixed. Update any one of the fields below.</p>
        <label>Full name<input value={profile.name} readOnly /></label>
        <label>Mobile number<input type="tel" inputMode="numeric" maxLength={11} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 11) })} placeholder="11 digit mobile number" /><span className="field-hint">Maximum 11 digits.</span></label>
        <label>Address<textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address" /></label>
        <label>Profile photo URL<input type="url" value={form.profilePhoto} onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })} placeholder="https://example.com/profile-photo.jpg" /><span className="field-hint">Paste a public image URL.</span></label>
        <button className="button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
      </form>
    </div>
    <section className="panel danger-zone"><div><h2>Delete account</h2><p className="muted">Your account will be deactivated and removed from the active platform.</p></div><button type="button" className="danger-button profile-delete-button" onClick={() => { setDeleteStep(1); setDeleteOpen(true); }}>Delete my account</button></section>
    {deleteOpen && <div className="confirmation-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget && !deleting) setDeleteOpen(false); }}><div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">{deleteStep === 1 ? <><div className="confirmation-icon"><AlertTriangle size={23} /></div><h2 id="delete-account-title">Deactivate your account?</h2><p>Your account will be soft deleted. You will be signed out and your profile will no longer appear as active.</p><div className="confirmation-actions"><button type="button" className="button button-ghost" disabled={deleting} onClick={() => setDeleteOpen(false)}>Keep account</button><button type="button" className="danger-confirm-button" disabled={deleting} onClick={() => setDeleteStep(2)}>Continue</button></div></> : <><div className="sad-emoji" aria-hidden="true">😢</div><h2 id="delete-account-title">We’re sad to see you go</h2><p>We’re really sad to see you go. Your account will be soft deleted after this final confirmation.</p><div className="confirmation-actions"><button type="button" className="button button-ghost" disabled={deleting} onClick={() => setDeleteStep(1)}>Go back</button><button type="button" className="danger-confirm-button" disabled={deleting} onClick={removeAccount}>{deleting ? "Deleting…" : "Yes, delete account"}</button></div></>}</div></div>}
  </>;
}
