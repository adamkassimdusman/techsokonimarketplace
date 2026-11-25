"use client";
import { useActionState, useState, useRef, useEffect } from "react";
import { autosaveDraft } from "@/app/draft-actions";
import { PhotoUploader } from "./photo-uploader";
import { saveListing } from "@/app/actions";
import type { Listing } from "@/lib/catalog";
const steps = [
  "Identify",
  "Specifications",
  "Condition",
  "Photographs",
  "Price & location",
  "Ownership",
  "Review",
];
export function ListingWizard({
  listing,
  serial = "",
  draft,
  existingPhotos = [],
}: {
  listing?: Listing;
  serial?: string;
  draft?: Record<string, string>;
  existingPhotos?: { id: string }[];
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draftStatus, setDraftStatus] = useState(
    draft
      ? "Your private text draft has been restored. Photos must be selected again."
      : "",
  );
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const [step, setStep] = useState(0);
  const [state, submit, pending] = useActionState(saveListing, {});
  const [review, setReview] = useState<Record<string, string>>({});
  const input = (name: string, label: string, type = "text", fallback = "") => (
    <label>
      {label}
      <input
        name={name}
        type={type}
        defaultValue={String(listing?.[name] ?? draft?.[name] ?? fallback)}
        required={!["battery", "serial", "gpu", "warranty"].includes(name)}
      />
    </label>
  );
  const select = (name: string, label: string, options: string[]) => (
    <label>
      {label}
      <select
        name={name}
        defaultValue={String(listing?.[name] ?? draft?.[name] ?? options[0])}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
  if (state.success && state.id)
    return (
      <div className="panel">
        <p className="success" role="status">
          {state.success}
        </p>
        <h2>Your listing is saved.</h2>
        <p>
          Open the saved listing to continue editing its details and
          photographs.
        </p>
        <div className="button-row">
          <a className="button" href={"/sell?edit=" + state.id}>
            Continue editing
          </a>
          <a className="button secondary" href="/dashboard">
            Go to your dashboard
          </a>
          <a href={"/laptop/" + state.id}>View listing</a>
        </div>
      </div>
    );
  return (
    <form
      action={submit}
      onSubmit={() => {
        if (timer.current) clearTimeout(timer.current);
      }}
      className="wizard"
      onChange={(e) => {
        const form = e.currentTarget;
        if (!listing && !state.id) {
          if (timer.current) clearTimeout(timer.current);
          setDraftStatus("Saving text draft…");
          const fields = new FormData(form);
          fields.set("revision", String(Date.now()));
          timer.current = setTimeout(async () => {
            const result = await autosaveDraft(fields);
            setDraftStatus(result.success || result.error || "");
          }, 1200);
        }
        setReview(
          Object.fromEntries(
            [...new FormData(form)].filter(
              ([, v]) => typeof v === "string",
            ) as [string, string][],
          ),
        );
      }}
    >
      <input type="hidden" name="intent" defaultValue="publish" />
      <input type="hidden" name="id" value={listing?.id ?? state.id ?? ""} />
      <p className="fine" aria-live="polite">
        {draftStatus}
      </p>
      <progress max={7} value={step + 1} aria-label="Listing progress" />
      <nav className="steps" aria-label="Listing steps">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            className={i === step ? "active" : "secondary"}
            onClick={() => setStep(i)}
            aria-current={i === step ? "step" : undefined}
          >
            {i + 1}. {s}
          </button>
        ))}
      </nav>
      <p className="eyebrow">STEP {step + 1} OF 7</p>
      <h2>{steps[step]}</h2>
      <fieldset hidden={step !== 0}>
        {select("brand", "Brand", [
          "HP",
          "Lenovo",
          "Dell",
          "Apple",
          "ASUS",
          "Acer",
          "Microsoft",
          "Other",
        ])}
        {input("model", "Family and exact model")}
        <label>
          Serial number — private
          <input name="serial" defaultValue={serial} maxLength={100} />
        </label>
      </fieldset>
      <fieldset hidden={step !== 1}>
        {input("cpu", "Exact processor model")}
        {input("ram", "RAM (GB)", "number", "8")}
        {input("storage", "Storage (GB)", "number", "256")}
        {select("storage_type", "Storage type", ["SSD", "HDD"])}
        {input("gpu", "Graphics processor", "text", "Integrated")}
        {input("screen", "Screen size, resolution and touch support")}
        {input("battery", "Battery health (%) if known", "number")}
      </fieldset>
      <fieldset hidden={step !== 2}>
        {select("condition", "Condition", [
          "Locally used",
          "Imported used",
          "Refurbished",
          "Brand new",
          "For parts or repair",
        ])}
        <label>
          Condition and included accessories
          <textarea
            name="description"
            minLength={20}
            maxLength={5000}
            defaultValue={listing?.description ?? draft?.description}
            required
          />
        </label>
        <label>
          Known faults and repairs
          <textarea
            name="faults"
            minLength={4}
            maxLength={3000}
            defaultValue={listing?.faults ?? draft?.faults}
            required
          />
        </label>
        <p className="muted">
          Disclose scratches, dents, screen and keyboard defects, battery or
          charging problems, missing parts, previous repairs, BIOS passwords and
          corporate management locks. Write “None known” only if accurate.
        </p>
        {input("warranty", "Warranty terms", "text", "No warranty")}
      </fieldset>
      <fieldset hidden={step !== 3}>
        <div className="notice">
          Use actual device photos: front, back, powered-on screen, keyboard,
          ports, defects and charger. Remove private information from the scene.
        </div>
        <PhotoUploader existing={existingPhotos} />
      </fieldset>
      <fieldset hidden={step !== 4}>
        <label>
          Selling price (KSh)
          <input
            name="price"
            type="number"
            min={100}
            max={5000000}
            defaultValue={listing ? listing.price / 100 : (draft?.price ?? "")}
            required
          />
        </label>
        <label>
          County
          <input
            name="county"
            defaultValue={listing?.county ?? draft?.county ?? "Nairobi"}
            required
          />
        </label>
        {input("town", "Town or general pickup area")}
        <label className="check">
          <input
            type="checkbox"
            name="negotiable"
            defaultChecked={
              listing?.negotiable ?? (draft ? draft.negotiable === "on" : true)
            }
          />
          Open to offers
        </label>
        <label className="check">
          <input
            type="checkbox"
            name="delivery"
            defaultChecked={listing?.delivery ?? draft?.delivery === "on"}
          />
          Delivery available (agree costs before purchase)
        </label>
        <p>Do not publish your residential address.</p>
      </fieldset>
      <fieldset hidden={step !== 5}>
        <label className="check">
          <input type="checkbox" name="ownership_declared" required />I own this
          laptop or am authorised to sell it; it is not knowingly stolen. The
          specifications are accurate and all known faults are disclosed. I
          accept the{" "}
          <a href="/policies/seller-agreement" target="_blank">
            seller agreement
          </a>
          .
        </label>
      </fieldset>
      <fieldset hidden={step !== 6}>
        <p>
          Review your details. Submission goes to moderation, not directly to
          the public catalogue.
        </p>
        <dl>
          {Object.entries(review)
            .filter(
              ([k]) =>
                ![
                  "serial",
                  "id",
                  "ownership_declared",
                  "intent",
                  "kept_photos",
                ].includes(k),
            )
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k.replaceAll("_", " ")}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
        <div className="notice">
          All specifications are seller-declared. Payment does not confer
          verification.
        </div>
      </fieldset>
      <div className="button-row">
        {step > 0 && (
          <button
            type="button"
            className="secondary"
            onClick={() => setStep(step - 1)}
          >
            Back
          </button>
        )}
        {step < 6 ? (
          <button
            type="button"
            key="continue"
            onClick={(e) => {
              const fieldsets =
                e.currentTarget.form?.querySelectorAll("fieldset");
              const inputs = fieldsets?.[
                step
              ].querySelectorAll<HTMLInputElement>("input,select,textarea");
              for (const input of inputs ?? []) {
                if (!input.checkValidity()) {
                  input.reportValidity();
                  return;
                }
              }
              setStep(step + 1);
            }}
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            key="publish"
            disabled={pending}
            onClick={(e) => {
              const form = e.currentTarget.form;
              if (form)
                (form.elements.namedItem("intent") as HTMLInputElement).value =
                  "publish";
              const invalid = form?.querySelector<HTMLInputElement>(":invalid");
              if (invalid) {
                e.preventDefault();
                const fs = invalid.closest("fieldset");
                setStep([...form!.querySelectorAll("fieldset")].indexOf(fs!));
                setTimeout(() => invalid.reportValidity(), 50);
              }
            }}
          >
            {pending ? "Saving…" : "Submit for review"}
          </button>
        )}
        <button
          type="submit"
          key="draft"
          onClick={(e) => {
            const form = e.currentTarget.form;
            if (form)
              (form.elements.namedItem("intent") as HTMLInputElement).value =
                "draft";
          }}
          formNoValidate
          className="secondary"
          disabled={pending}
        >
          Save draft
        </button>
      </div>
      {state.error && (
        <p role="alert" className="error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="success">
          {state.success} <a href="/dashboard">Go to your dashboard</a>
        </p>
      )}
    </form>
  );
}
