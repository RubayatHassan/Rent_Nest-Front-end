"use client";

import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { money } from "../../../lib/mappers";
import { useSavedHomes } from "../../../hooks/useSavedHomes";

export default function SavedHomesPage() {
  const { homes, toggle } = useSavedHomes();

  return <div><div className="resource-head"><div><p className="eyebrow">Your shortlist</p><h1>Saved homes</h1></div><span className="review-count">{homes.length} {homes.length === 1 ? "home" : "homes"}</span></div>{homes.length === 0 ? <div className="panel review-empty"><Bookmark size={28} /><h2>No saved homes yet</h2><p>Save a property from its details page and it will appear here.</p><Link href="/properties" className="button">Explore properties</Link></div> : <div className="saved-homes-grid">{homes.map((home, index) => <article className="property-card saved-home-card" key={home.id}><Link href={`/properties/${home.id}`}><div className={`property-image ${index % 3 === 1 ? "two" : index % 3 === 2 ? "three" : ""}`} style={home.images?.[0] ? { backgroundImage: `url(${home.images[0]})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} /><div className="property-info"><h3>{home.title}</h3><p>{home.location}</p><div className="price"><strong>{money(home.rentAmount)}</strong><span>per month</span></div></div></Link><button type="button" className="saved-remove-button" onClick={() => toggle(home)}><Trash2 size={14} /> Remove</button></article>)}</div>}</div>;
}
