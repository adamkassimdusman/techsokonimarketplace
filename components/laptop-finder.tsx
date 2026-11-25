"use client";
import { useState } from "react";
import Link from "next/link";
import { useCases } from "@/lib/discovery";
export function LaptopFinder() {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState("50000");
  const [use, setUse] = useState("office");
  const [brand, setBrand] = useState("");
  const [battery, setBattery] = useState(false);
  const query = new URLSearchParams({
    max: budget,
    use,
    ...(brand ? { brand } : {}),
    ...(battery ? { battery: "80" } : {}),
  });
  return (
    <div className="wizard">
      <progress max={3} value={step + 1} aria-label="Finder progress" />
      <p className="eyebrow">STEP {step + 1} OF 3</p>
      {step === 0 ? (
        <>
          <h2>What’s your budget?</h2>
          <p>Set a maximum asking price in Kenyan shillings.</p>
          <label>
            Maximum budget (KSh)
            <input
              type="number"
              min={100}
              max={5000000}
              step={100}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </label>
          <input
            aria-label="Adjust budget"
            type="range"
            min={10000}
            max={200000}
            step={5000}
            value={Math.max(10000, Math.min(200000, Number(budget)))}
            onChange={(e) => setBudget(e.target.value)}
          />
        </>
      ) : step === 1 ? (
        <>
          <h2>What will you use it for?</h2>
          <div className="use-choice-grid">
            {Object.entries(useCases).map(([key, v]) => (
              <button
                type="button"
                aria-pressed={key === use}
                className={key === use ? "" : "secondary"}
                key={key}
                onClick={() => setUse(key)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className="notice">{useCases[use].note}</p>
        </>
      ) : (
        <>
          <h2>A few preferences</h2>
          <label>
            Preferred brand
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">Any brand</option>
              {["HP", "Lenovo", "Dell", "Apple", "ASUS", "Acer"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={battery}
              onChange={(e) => setBattery(e.target.checked)}
            />
            Only show declared battery health of at least 80%
          </label>
          <p className="notice">
            {useCases[use].note} Battery figures are seller-declared. Missing
            measurements are excluded when this preference is selected.
          </p>
          <Link className="button" href={"/marketplace?" + query}>
            Show matching laptops
          </Link>
        </>
      )}
      <div className="button-row">
        {step > 0 && (
          <button className="secondary" onClick={() => setStep(step - 1)}>
            Previous
          </button>
        )}
        {step < 2 && (
          <button
            disabled={
              !Number.isFinite(Number(budget)) ||
              Number(budget) < 100 ||
              Number(budget) > 5000000
            }
            onClick={() => setStep(step + 1)}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
