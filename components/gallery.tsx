"use client";
import { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Share2,
} from "lucide-react";
import { Dialog } from "./ui";
export function Gallery({
  images,
  name,
}: {
  images: { id: string }[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const start = useRef(0);
  const move = (n: number) => {
    setIndex((i) => (i + n + images.length) % images.length);
    setZoom(false);
  };
  if (!images.length)
    return (
      <div className="empty">
        <p>No photographs uploaded.</p>
      </div>
    );
  const controls = (
    <>
      <button
        type="button"
        className="icon-button photo-nav photo-prev"
        aria-label="Previous photo"
        onClick={() => move(-1)}
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        className="icon-button photo-nav photo-next"
        aria-label="Next photo"
        onClick={() => move(1)}
      >
        <ChevronRight />
      </button>
    </>
  );
  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        }
      }}
      onTouchStart={(e) => {
        start.current = e.changedTouches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const delta = e.changedTouches[0].clientX - start.current;
        if (Math.abs(delta) > 50) move(delta > 0 ? -1 : 1);
      }}
    >
      <div className="photo-stage">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open full-screen photo"
        >
          <img
            src={"/media/" + images[index].id}
            alt={name + " — seller photograph " + (index + 1)}
            width={800}
            height={600}
            fetchPriority="high"
          />
        </button>
        <span className="photo-count" aria-live="polite">
          {index + 1} / {images.length}
        </span>
        {images.length > 1 && controls}
      </div>
      <div className="photo-thumbs" aria-label="Product photographs">
        {images.map((img, i) => (
          <button
            type="button"
            key={img.id}
            aria-label={"Show photo " + (i + 1)}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            <img
              src={"/media/" + img.id}
              alt=""
              loading="lazy"
              width={76}
              height={60}
            />
          </button>
        ))}
      </div>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setZoom(false);
        }}
        title={name + " · " + (index + 1) + " of " + images.length}
        className="gallery-dialog"
      >
        <div className={"zoom-image " + (zoom ? "zoomed" : "")}>
          <img
            src={"/media/" + images[index].id}
            alt={name + " — full-size photograph " + (index + 1)}
          />
        </div>
        <div className="button-row">
          <button className="secondary" onClick={() => move(-1)}>
            <ChevronLeft size={17} />
            Previous
          </button>
          <button className="secondary" onClick={() => setZoom(!zoom)}>
            {zoom ? <ZoomOut size={17} /> : <ZoomIn size={17} />}{" "}
            {zoom ? "Fit image" : "Zoom in"}
          </button>
          <button className="secondary" onClick={() => move(1)}>
            Next
            <ChevronRight size={17} />
          </button>
        </div>
      </Dialog>
    </div>
  );
}
export function ShareListing() {
  const [message, setMessage] = useState("");
  return (
    <>
      <button
        type="button"
        className="secondary"
        onClick={async () => {
          try {
            if (navigator.share) {
              await navigator.share({
                title: document.title,
                url: location.href,
              });
            } else {
              await navigator.clipboard.writeText(location.href);
              setMessage("Link copied.");
            }
          } catch {
            setMessage("Copy the page address to share this laptop.");
          }
        }}
      >
        <Share2 size={16} />
        Share
      </button>
      {message && (
        <span className="fine" role="status">
          {message}
        </span>
      )}
    </>
  );
}
