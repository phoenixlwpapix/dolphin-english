"use client";

import { useState, type ReactNode, useEffect } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { Button, LanguageSwitcher, ThemeToggle, Modal } from "@/components/ui";
import { SignInForm } from "@/components/auth";
import { useI18n } from "@/lib/i18n";

interface HeaderProps {
  children?: ReactNode;
  isSignInOpen?: boolean;
  onSignInOpenChange?: (isOpen: boolean) => void;
  variant?: "default" | "landing";
}

export function Header({
  children,
  isSignInOpen,
  onSignInOpenChange,
  variant = "default"
}: HeaderProps) {
  const { t, language } = useI18n();
  const currentUser = useQuery(api.users.getCurrentUser);
  const [internalSignInOpen, setInternalSignInOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (variant !== "landing") return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  const showSignInModal = isSignInOpen ?? internalSignInOpen;
  const setShowSignInModal = onSignInOpenChange ?? setInternalSignInOpen;

  // Use different font based on language
  const titleFontClass =
    language === "zh"
      ? "font-[family-name:var(--font-zcool)]"
      : "font-handwriting";

  const headerClasses = variant === "landing"
    ? `fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled
      ? "top-0 left-0 w-full rounded-none border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm"
      : "top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl rounded-full border border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-xl shadow-lg ring-1 ring-black/5"
    }`
    : "sticky top-0 z-40 w-full glass-card border-b border-border/50";

  const containerClasses = variant === "landing" && !isScrolled
    ? "container mx-auto flex h-[80px] items-center justify-between px-8"
    : "container mx-auto flex h-20 items-center justify-between px-4";

  return (
    <>
      <header className={headerClasses}>
        <div className={containerClasses}>
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo-v2.png"
                alt="Dolphin English Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className={`text-3xl font-bold gradient-text ${titleFontClass}`}>
                {t.app.title}
              </h1>
              <p className="text-sm text-muted-foreground font-medium hidden md:block">
                {t.app.subtitle}
              </p>
            </div>
          </a>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {children}

            {/* Auth UI */}
            {currentUser === undefined ? (
              // Loading state
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
            ) : currentUser ? (
              // Logged in state - Moved to Sidebar Settings
              null
            ) : (
              // Logged out state
              <Button
                onClick={() => setShowSignInModal(true)}
                className="rounded-xl bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              >
                {t.auth?.signIn || "Sign In"}
              </Button>
            )}

            {/* <ThemeToggle /> */}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Sign In Modal */}
      <Modal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        title={t.auth?.signInTitle || "Welcome"}
      >
        <SignInForm onSuccess={() => setShowSignInModal(false)} />
      </Modal>
    </>
  );
}
