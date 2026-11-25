import Link from "next/link";
export const metadata = { title: "How it works" };
export default function How() {
  return (
    <div className="narrow section">
      <div className="eyebrow">A SIMPLER WAY TO BUY AND SELL</div>
      <h1>Your laptop. Its next chapter.</h1>
      <h2>Buying a laptop</h2>
      <ol>
        <li>Search by brand, model, budget, memory and storage.</li>
        <li>
          Read the declared specifications, condition, faults and warranty.
        </li>
        <li>
          Create an account to save a listing, message the seller or make an
          offer.
        </li>
        <li>
          Request an inspection when an approved location has available
          appointments.
        </li>
        <li>
          Agree collection or delivery directly. Accepted offers reserve a
          laptop; they do not record a paid transaction.
        </li>
      </ol>
      <h2>Selling a laptop</h2>
      <ol>
        <li>Create one account for buying and selling.</li>
        <li>Complete your profile and the seven-step listing form.</li>
        <li>Upload at least five real photos and disclose all known faults.</li>
        <li>Submit for moderation and follow its status in your dashboard.</li>
        <li>
          Reply to enquiries, negotiate offers and mark the laptop sold when the
          sale is complete.
        </li>
      </ol>
      <Link className="button" href="/sell">
        Create your first listing
      </Link>
    </div>
  );
}
