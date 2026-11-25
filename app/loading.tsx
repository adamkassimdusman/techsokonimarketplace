export default function Loading() {
  return (
    <div
      className="wrap section"
      style={{ minHeight: "calc(100dvh - 126px)" }}
      role="status"
      aria-label="Loading"
    >
      <div
        className="skeleton"
        style={{ height: 32, width: "45%", marginBottom: 24 }}
      />
      <div className="loading-grid">
        {[0, 1, 2, 3].map((i) => (
          <div className="skeleton skeleton-card" key={i} />
        ))}
      </div>
      <p className="fine">Loading the marketplace…</p>
    </div>
  );
}
