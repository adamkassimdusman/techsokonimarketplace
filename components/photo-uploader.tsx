"use client";
import { useState, useRef, useEffect } from "react";
type Photo = { key: string; url: string; file?: File; id?: string };
export function PhotoUploader({
  existing = [],
}: {
  existing?: { id: string }[];
}) {
  const [photos, setPhotos] = useState<Photo[]>(
    existing.map((p) => ({ key: p.id, id: p.id, url: "/media/" + p.id })),
  );
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);
  function sync(next: Photo[]) {
    setPhotos(next);
    if (input.current) {
      const dt = new DataTransfer();
      next.forEach((p) => {
        if (p.file) dt.items.add(p.file);
      });
      input.current.files = dt.files;
      input.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
  function add(files: FileList | File[]) {
    const incoming = Array.from(files);
    if (
      incoming.some(
        (f) =>
          !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
          f.size > 5 * 1024 * 1024,
      )
    ) {
      setError("Choose JPEG, PNG or WebP files up to 5 MB each.");
      return;
    }
    if (photos.length + incoming.length > 10) {
      setError("Choose no more than 10 photographs in total.");
      return;
    }
    setError("");
    sync([
      ...photos,
      ...incoming.map((file) => {
        const url = URL.createObjectURL(file);
        urls.current.push(url);
        return { key: crypto.randomUUID(), file, url };
      }),
    ]);
  }
  return (
    <>
      <div
        className="photo-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          add(e.dataTransfer.files);
        }}
      >
        <strong>Show buyers the actual laptop.</strong>
        <p>
          Drop photos here, or choose photos from your device. The first photo
          is your cover.
        </p>
        <label>
          Add 5–10 photographs (JPEG, PNG or WebP; 5 MB each)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => {
              if (e.target.files) add(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <input
        ref={input}
        type="file"
        name="photos"
        multiple
        hidden
        aria-hidden="true"
        tabIndex={-1}
      />
      <input
        type="hidden"
        name="kept_photos"
        value={photos
          .filter((p) => p.id)
          .map((p) => p.id)
          .join(",")}
      />
      <p className="fine">
        {photos.length} of 10 photos · Images are resized and metadata removed
        on save. Upload may take a moment.
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="photo-preview-grid">
        {photos.map((p, i) => (
          <div key={p.key}>
            <img
              src={p.url}
              alt={"Listing photo " + (i + 1) + (i === 0 ? " — cover" : "")}
              width={240}
              height={180}
            />
            <small>{i === 0 ? "Cover photo" : "Photo " + (i + 1)}</small>
            <div className="photo-controls">
              <button
                type="button"
                className="secondary"
                disabled={i === 0 || (!p.id && !!photos[i - 1]?.id)}
                aria-label={"Move photo " + (i + 1) + " earlier"}
                onClick={() => {
                  const next = [...photos];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  sync(next);
                }}
              >
                Move earlier
              </button>
              <button
                type="button"
                className="secondary"
                aria-label={"Remove photo " + (i + 1)}
                onClick={() => sync(photos.filter((x) => x.key !== p.key))}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {existing.length > 0 && (
        <p className="fine">
          Existing photos stay before new uploads. Remove unwanted photos before
          saving. At least five must remain for review.
        </p>
      )}
    </>
  );
}
