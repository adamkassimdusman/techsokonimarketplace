import Link from "next/link";
import {
  ShieldCheck,
  MessageSquare,
  SlidersHorizontal,
  Search,
  GraduationCap,
  Code2,
  Briefcase,
  Gamepad2,
  PenTool,
  Building2,
  Video,
  Headphones,
  Monitor,
  Store,
} from "lucide-react";
import { catalog } from "@/lib/catalog";
import { ListingCard, EmptyCatalog } from "@/components/catalog";
import { QueryForm } from "@/components/search-controls";
import { useCases } from "@/lib/discovery";
const icons = [
  GraduationCap,
  Briefcase,
  Code2,
  Building2,
  Building2,
  PenTool,
  Video,
  Gamepad2,
  Headphones,
  Monitor,
];
export default async function Home() {
  const { rows, total } = await catalog();
  return (
    <>
      <section className="market-hero">
        <div className="wrap" style={{ padding: 0 }}>
          <div className="hero-head">
            <div>
              <div className="eyebrow">THE LAPTOP MARKETPLACE · KENYA</div>
              <h1>Find your next laptop.</h1>
              <p>
                Discover laptops from private sellers and dealers across Kenya.
                Know the specs. Find your price.
              </p>
            </div>
            <Link href="/sell" className="hero-side-link">
              Have a laptop to sell?
            </Link>
          </div>
          <QueryForm className="discovery-search">
            <label>
              WHAT ARE YOU LOOKING FOR?
              <input
                name="q"
                aria-label="Find a laptop"
                placeholder="Try “HP EliteBook under 30K”"
              />
            </label>
            <label>
              YOUR BUDGET
              <select name="max" aria-label="Maximum budget">
                <option value="">Any budget</option>
                {[20000, 30000, 50000, 75000, 100000].map((v) => (
                  <option key={v} value={v}>
                    Under KSh {v.toLocaleString("en-KE")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              LOCATION
              <input
                name="county"
                placeholder="All Kenya"
                list="home-counties"
              />
            </label>
            <datalist id="home-counties">
              {[
                "Nairobi",
                "Mombasa",
                "Kiambu",
                "Kisumu",
                "Nakuru",
                "Uasin Gishu",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </datalist>
            <button>
              <Search size={18} />
              Find a laptop
            </button>
          </QueryForm>
          <div className="discovery-row">
            <span>Browse brands</span>
            {["HP", "Lenovo", "Dell", "Apple", "ASUS", "Acer", "Other"].map(
              (b) => (
                <Link key={b} className="chip" href={"/marketplace?brand=" + b}>
                  {b}
                </Link>
              ),
            )}
          </div>
        </div>
      </section>
      <div className="wrap">
        <nav className="budget-row" aria-label="Browse by budget">
          <strong>Shop by budget</strong>
          {[
            ["Under 20K", "max=20000"],
            ["20K–30K", "min=20000&max=30000"],
            ["30K–50K", "min=30000&max=50000"],
            ["50K–75K", "min=50000&max=75000"],
            ["Above 75K", "min=75000"],
          ].map(([t, q]) => (
            <Link className="chip" key={q} href={"/marketplace?" + q}>
              KSh {t}
            </Link>
          ))}
        </nav>
        <div className="home-main">
          <section>
            <div className="section-heading horizontal">
              <div>
                <h2>Fresh on the marketplace</h2>
                <p>
                  {total
                    ? total + " available laptops · Recently listed"
                    : "Real laptops. Actual seller photographs. Reviewed before publication."}
                </p>
              </div>
              <Link className="text-link" href="/marketplace">
                Browse all
              </Link>
            </div>
            {rows.length ? (
              <div className="listing-grid">
                {rows.slice(0, 6).map((item) => (
                  <ListingCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyCatalog />
            )}
          </section>
          <aside className="home-side">
            <div>
              <h3>A laptop for your everyday</h3>
              <div className="use-links">
                {Object.entries(useCases).map(([key, u], i) => {
                  const Icon = icons[i];
                  return (
                    <Link key={key} href={"/marketplace?use=" + key}>
                      <Icon size={15} />
                      {u.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="finder-callout">
              <h3>Not sure where to start?</h3>
              <p>
                Tell us your budget and what you do. Find matching laptops with
                clear reasons.
              </p>
              <Link href="/finder" className="button">
                Find my laptop
              </Link>
            </div>
          </aside>
        </div>
        <div className="editorial-strip">
          <Link href="/trust#inspections">
            <ShieldCheck size={23} />
            <span>
              <strong>Know what’s been checked</strong>
              <small>
                Understand seller declarations and physical inspections.
              </small>
            </span>
          </Link>
          <Link href="/trust#safe-meetings">
            <MessageSquare size={23} />
            <span>
              <strong>A safer way to meet</strong>
              <small>
                Ask questions, inspect the device and confirm payment yourself.
              </small>
            </span>
          </Link>
          <Link href="/compare">
            <SlidersHorizontal size={23} />
            <span>
              <strong>Compare the details</strong>
              <small>
                Look beyond the model name. Compare up to four laptops.
              </small>
            </span>
          </Link>
        </div>
        <section className="compact-sell">
          <div>
            <h2>Your unused laptop. Someone’s next upgrade.</h2>
            <p>Add real photos, set your price and connect with buyers.</p>
          </div>
          <Link href="/sell" className="button">
            Sell your laptop
          </Link>
        </section>
        <div className="editorial-strip">
          <Link href="/dealers">
            <Store size={23} />
            <span>
              <strong>Find a laptop dealer</strong>
              <small>
                Browse businesses with available marketplace inventory.
              </small>
            </span>
          </Link>
          <Link href="/insights">
            <SlidersHorizontal size={23} />
            <span>
              <strong>Understand asking prices</strong>
              <small>
                Compare similar configurations using genuine listing data.
              </small>
            </span>
          </Link>
          <Link href="/how-it-works">
            <Monitor size={23} />
            <span>
              <strong>Make a more informed choice</strong>
              <small>Learn what to check before buying a used laptop.</small>
            </span>
          </Link>
        </div>
        <section className="section faq">
          <h2>A few things worth knowing</h2>
          {[
            [
              "Is every laptop physically verified?",
              "No. Specifications and condition are seller-declared unless a completed independent inspection is explicitly shown.",
            ],
            [
              "Can I pay through Tech Sokoni?",
              "Protected checkout is not available. Do not send advance payments to unknown sellers. Inspect the device and independently confirm any payment.",
            ],
            [
              "How do I publish a laptop?",
              "Create an account, complete the listing form, upload at least five actual device photos and submit for moderation.",
            ],
            [
              "Where can I book an inspection?",
              "Available locations and times appear on individual listing pages after an administrator has configured them.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      </div>
    </>
  );
}
