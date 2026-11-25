import { LaptopFinder } from "@/components/laptop-finder";
export const metadata = { title: "Find my laptop" };
export default function Finder() {
  return (
    <div className="narrow section">
      <div className="eyebrow">A LITTLE GUIDANCE. A BETTER SHORTLIST.</div>
      <h1>Find a laptop that fits your day.</h1>
      <p>
        Choose your budget, main use and preferences. We apply clear
        specification filters to current listings—no invented recommendations.
      </p>
      <LaptopFinder />
    </div>
  );
}
