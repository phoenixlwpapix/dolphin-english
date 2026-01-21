"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { Button, LanguageSwitcher, Modal } from "@/components/ui";
import { SignInForm } from "@/components/auth";
import { useI18n } from "@/lib/i18n";

interface HeaderProps {
  children?: ReactNode;
  isSignInOpen?: boolean;
  onSignInOpenChange?: (isOpen: boolean) => void;
}

export function Header({ children, isSignInOpen, onSignInOpenChange }: HeaderProps) {
  const { t, language } = useI18n();
  const currentUser = useQuery(api.users.getCurrentUser);
  const [internalSignInOpen, setInternalSignInOpen] = useState(false);

  const showSignInModal = isSignInOpen ?? internalSignInOpen;
  const setShowSignInModal = onSignInOpenChange ?? setInternalSignInOpen;

  // Use different font based on language
  const titleFontClass =
    language === "zh"
      ? "font-[family-name:var(--font-zcool)]"
      : "font-handwriting";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src="/logo.png"
                alt="Dolphin English Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className={`text-3xl font-bold text-primary ${titleFontClass}`}>
                {t.app.title}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
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
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : currentUser ? (
              // Logged in state - Moved to Sidebar Settings
              null
            ) : (
              // Logged out state
              <Button onClick={() => setShowSignInModal(true)}>
                {t.auth?.signIn || "Sign In"}
              </Button>
            )}

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
