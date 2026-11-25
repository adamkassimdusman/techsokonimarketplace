"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="narrow section">
      <h1>We couldn’t load this page.</h1>
      <p>
        Please try again. If this continues, check the database configuration.
      </p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
