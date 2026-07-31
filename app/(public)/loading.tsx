export default function Loading() {
  return (
    <main className="section route-loading" aria-label="Loading page">
      <div className="skeleton-line skeleton-title" />
      <div className="property-grid">
        {[1, 2, 3].map((item) => (
          <div className="property-card skeleton-card" key={item} />
        ))}
      </div>
    </main>
  );
}
