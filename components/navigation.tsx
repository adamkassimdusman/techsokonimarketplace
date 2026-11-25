"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";
import {
  Home,
  Search,
  Plus,
  MessageSquare,
  UserRound,
  Bell,
  Heart,
  MapPin,
  ChevronDown,
  Laptop,
  ShieldCheck,
} from "lucide-react";
export function Navigation({
  name,
  role,
  unread,
  notifications,
}: {
  name?: string;
  role?: string;
  unread: number;
  notifications: number;
}) {
  const path = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [path]);
  return (
    <>
      <header className="market-header">
        <div className="market-header-inner wrap">
          <Link
            className="logo"
            href="/"
            aria-label="Tech Sokoni Marketplace home"
          >
            <span className="logo-icon">
              <Laptop size={23} />
            </span>
            <span>
              tech<span className="teal">sokoni</span>
              <small>MARKETPLACE</small>
            </span>
          </Link>
          <form action="/marketplace" className="global-search">
            <Search size={18} />
            <input
              name="q"
              aria-label="Search laptops"
              placeholder="Brand, model, or “HP under 30K”"
            />
            <button className="icon-button" aria-label="Search">
              <Search size={19} />
            </button>
          </form>
          <div className="nav-actions">
            <Link
              href="/favourites"
              className="icon-button desktop-action"
              aria-label="Favourites"
            >
              <Heart size={20} />
            </Link>
            <Link
              href="/messages"
              className="icon-button desktop-action"
              aria-label="Messages"
            >
              <MessageSquare size={20} />
              {unread > 0 && <span className="count-dot">{unread}</span>}
            </Link>
            <Link
              href="/dashboard#notifications"
              className="icon-button"
              aria-label={
                notifications
                  ? notifications + " unread notifications"
                  : "Notifications"
              }
            >
              <Bell size={20} />
              {notifications > 0 && (
                <span className="count-dot">{notifications}</span>
              )}
            </Link>
            <details
              ref={menu}
              className="account-menu"
              onKeyDown={(e) => {
                if (e.key === "Escape") e.currentTarget.open = false;
              }}
            >
              <summary>
                <UserRound size={20} />
                <span>{name?.split(" ")[0] || "Account"}</span>
                <ChevronDown size={14} />
              </summary>
              <div className="account-popover">
                <strong>{name || "Welcome to Tech Sokoni"}</strong>
                <Link href={name ? "/dashboard" : "/account"}>
                  {name ? "My dashboard" : "Sign in / register"}
                </Link>
                <Link href="/favourites">Saved laptops</Link>
                <Link href="/messages">Messages & offers</Link>
                <Link href="/support">Help & support</Link>
                {(role === "admin" || role === "super_admin") && (
                  <>
                    <Link href="/admin#listing-moderation">
                      Listing approvals
                    </Link>
                    <Link href="/admin/interactions">Client interactions</Link>
                  </>
                )}
                {role === "super_admin" && (
                  <Link href="/super-admin">Super admin</Link>
                )}
              </div>
            </details>
            <Link href="/sell" className="button desktop-sell">
              <Plus size={17} />
              Sell a laptop
            </Link>
          </div>
        </div>
        <nav className="discovery-nav wrap" aria-label="Marketplace">
          <Link href="/marketplace">Browse laptops</Link>
          <Link href="/marketplace?inspected=yes">Verified laptops</Link>
          <Link href="/dealers">Dealers</Link>
          <Link href="/insights">Market insights</Link>
          <Link href="/finder">Find my laptop</Link>
          <Link href="/trust">
            <ShieldCheck size={15} />
            Trust & safety
          </Link>
          <details className="location-menu">
            <summary>
              <MapPin size={15} />
              All Kenya
              <ChevronDown size={13} />
            </summary>
            <form action="/marketplace">
              <label>
                Choose county
                <input name="county" placeholder="e.g. Nairobi" />
              </label>
              <button>Browse location</button>
            </form>
          </details>
        </nav>
      </header>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {[
          { href: "/", label: "Home", Icon: Home },
          { href: "/marketplace", label: "Explore", Icon: Search },
          { href: "/sell", label: "Sell", Icon: Plus },
          { href: "/messages", label: "Messages", Icon: MessageSquare },
          {
            href: name ? "/dashboard" : "/account",
            label: "Account",
            Icon: UserRound,
          },
        ].map(({ href, label, Icon }) => (
          <Link
            href={href}
            key={label}
            aria-current={path === href ? "page" : undefined}
            className={label === "Sell" ? "sell-tab" : ""}
          >
            <span>
              <Icon size={21} />
              {label === "Messages" && unread > 0 && (
                <b className="count-dot">{unread}</b>
              )}
            </span>
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
