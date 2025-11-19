"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import LogoutButton from "../ui/LogoutButton";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-[rgba(0,0,0,0.06)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-foreground">
              HabitTracker
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/habits" className="text-sm text-muted-foreground hover:text-foreground">
              Habitudes
            </Link>
            <LogoutButton />
          </nav>

          {/* Burger for small screens */}
          <div className="md:hidden">
            <button
              aria-label="Ouvrir le menu"
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-md inline-flex items-center justify-center hover:bg-gray-100"
            >
              <svg className="h-6 w-6 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (overlay slide-in from right) */}
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
              className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl z-50"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Menu</div>
                  <button
                    aria-label="Fermer"
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <svg className="h-6 w-6 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <motion.nav
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.06 } },
                  }}
                  className="mt-6 flex-1"
                >
                  <motion.div variants={{ hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0 } }} className="mb-4">
                    <Link href="/dashboard" className="block text-base text-foreground font-medium" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0 } }} className="mb-4">
                    <Link href="/habits" className="block text-base text-foreground font-medium" onClick={() => setOpen(false)}>
                      Habitudes
                    </Link>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0 } }} className="mt-auto">
                    <LogoutButton />
                  </motion.div>
                </motion.nav>
              </div>
            </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
