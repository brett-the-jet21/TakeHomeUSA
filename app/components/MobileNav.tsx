"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/",        label: "Calculator"     },
  { href: "/states",  label: "State Guides"   },
  { href: "/compare", label: "Compare States" },
  { href: "/about",   label: "About"          },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="sm:hidden">
      {/* Hamburger / close button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        className="flex flex-col justify-center items-center gap-[5px] w-11 h-11 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors ml-1"
      >
        {/* Hamburger lines — animate to X */}
        <span
          className="block w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-200 origin-center"
          style={open ? { transform: "translateY(7px) rotate(45deg)" } : {}}
        />
        <span
          className="block w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-200"
          style={open ? { opacity: 0, transform: "scaleX(0)" } : {}}
        />
        <span
          className="block w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-200 origin-center"
          style={open ? { transform: "translateY(-7px) rotate(-45deg)" } : {}}
        />
      </button>

      {open && (
        <>
          {/* Invisible backdrop — tapping outside closes menu */}
          <div
            className="fixed inset-0 z-30"
            aria-hidden
            onClick={close}
          />

          {/* Menu panel */}
          <div
            id="mobile-nav-menu"
            className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-40"
          >
            <nav className="container-page py-2 pb-3">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-3.5 text-base font-semibold text-gray-700 hover:text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-xl transition-colors"
                  style={{ minHeight: 44 }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
