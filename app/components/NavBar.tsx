"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoutButton from "../ui/LogoutButton";
import { useTheme } from "../providers/ThemeProvider";
import { ClairIcon, SombreIcon } from "@/lib/Icon";
import LinkNav from "../ui/LinkNav";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const NavContent = ({ onClose }: { onClose?: () => void }) => (
    <nav className="flex flex-col gap-4">
      <LinkNav name="Dashboard" path="dashboard" onClose={onClose} />

      <LinkNav name="Habitudes" path="habits" onClose={onClose} />

      <LinkNav name="Profil" path="profile" onClose={onClose} />

      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 text-base text-foreground font-medium hover:text-primary cursor-pointer transition-colors w-full text-left"
      >
        {theme === "dark" ? (
          <>
            <ClairIcon />
            Mode clair
          </>
        ) : (
          <>
            <SombreIcon />
            Mode sombre
          </>
        )}
      </button>

      <div className="mt-4 pt-4 border-t border-border">
        <LogoutButton  />
      </div>
    </nav>
  );

  return (
    <>
      {/* Header pour mobile seulement */}
      <header className="md:hidden w-full bg-background border-b border-[rgba(0,0,0,0.06)] fixed top-0 left-0 right-0 z-30">
        <div className="px-4 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-foreground">
            HabitTracker
          </Link>

          <button
            aria-label="Ouvrir le menu"
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md inline-flex items-center justify-center hover:bg-muted"
          >
            <svg className="h-6 w-6 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Panneau latéral pour desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-background border-r border-[rgba(0,0,0,0.06)] z-30">
        <div className="p-6 flex flex-col w-full">
          <Link href="/" className="text-xl font-bold text-foreground mb-8">
            HabitTracker
          </Link>
          <NavContent />
        </div>
      </aside>

      {/* Menu mobile (overlay slide-in from right) */}
      <div className="md:hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40"
            >
              {/* Backdrop */}
              <motion.button
                aria-label="Fermer le menu"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 bg-black/40"
              />

              {/* Sliding panel */}
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.28 }}
                className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-background shadow-xl z-50"
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-lg font-semibold">Menu</div>
                    <button
                      aria-label="Fermer"
                      onClick={() => setOpen(false)}
                      className="p-2 rounded-md hover:bg-muted"
                    >
                      <svg className="h-6 w-6 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <NavContent onClose={() => setOpen(false)} />
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
