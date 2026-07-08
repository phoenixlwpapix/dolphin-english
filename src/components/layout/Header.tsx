"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, LanguageSwitcher, ThemeToggle, Modal } from "@/components/ui";
import {
  BookOpenIcon,
  LibraryIcon,
  BarChart3Icon,
  BookAIcon,
  ShieldIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
  MenuIcon,
  XIcon,
} from "@/components/ui/Icons";
import { SignInForm } from "@/components/auth";
import { useI18n } from "@/lib/i18n";
import { useAuthActions } from "@convex-dev/auth/react";

export type NavTab = "explore" | "my" | "settings" | "analytics" | "vocab" | "admin";

interface HeaderProps {
  children?: ReactNode;
  isSignInOpen?: boolean;
  onSignInOpenChange?: (isOpen: boolean) => void;
  variant?: "default" | "landing";
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

export function Header({
  children,
  isSignInOpen,
  onSignInOpenChange,
  variant = "default",
  activeTab,
  onTabChange,
}: HeaderProps) {
  const { t } = useI18n();
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.users.getCurrentUser);
  const [internalSignInOpen, setInternalSignInOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (variant !== "landing") return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isUserMenuOpen]);

  // Close mobile menu on tab change
  const handleTabChange = (tab: NavTab) => {
    onTabChange?.(tab);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
      setIsUserMenuOpen(false);
    }
  };

  const showSignInModal = isSignInOpen ?? internalSignInOpen;
  const setShowSignInModal = onSignInOpenChange ?? setInternalSignInOpen;



  const headerClasses = variant === "landing"
    ? `fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled
      ? "top-0 left-0 w-full rounded-none border-b border-border bg-surface shadow-sm"
      : "top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl rounded-xl border border-border bg-surface/95 backdrop-blur-sm shadow-sm"
    }`
    : "sticky top-0 z-40 w-full bg-surface border-b border-border shadow-sm";

  const navItems = [
    { id: "my" as const, icon: BookOpenIcon, label: t.sidebar.myCourses },
    { id: "explore" as const, icon: LibraryIcon, label: t.sidebar.explore },
    { id: "vocab" as const, icon: BookAIcon, label: t.sidebar.vocabPractice },
    { id: "analytics" as const, icon: BarChart3Icon, label: t.sidebar.analytics },
  ];

  return (
    <>
      <header className={headerClasses}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Left — Logo */}
          <Link href="/" className="flex items-center h-full py-1.5 group shrink-0">
            <div className="relative h-full aspect-[606/275] transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/dolphin-logo-3.png"
                alt="Dolphin English Logo"
                fill
                sizes="150px"
                className="object-contain dark:brightness-0 dark:invert"
                priority
              />
            </div>
          </Link>

          {/* Center — Nav Tabs (desktop, logged-in only) */}
          {currentUser && onTabChange && (
            <nav className="hidden md:flex items-center gap-1 mx-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right — Controls */}
          <div className="flex items-center gap-2">
            {children}

            <ThemeToggle />
            <LanguageSwitcher />

            {/* User Menu / Auth */}
            {currentUser === undefined ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-800 text-white text-sm font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-sm"
                  aria-label={t.sidebar.userMenu}
                >
                  {currentUser.email?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl animate-slide-up overflow-hidden z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">
                        {currentUser.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isAdmin ? "Admin" : t.sidebar.userMenu}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {isAdmin && (
                        <button
                          onClick={() => { handleTabChange("admin"); setIsUserMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            activeTab === "admin"
                              ? "bg-accent/10 text-accent"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <ShieldIcon className="w-4 h-4" />
                          {t.sidebar.admin}
                        </button>
                      )}
                      <button
                        onClick={() => { handleTabChange("settings"); setIsUserMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          activeTab === "settings"
                            ? "bg-accent/10 text-accent"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <SettingsIcon className="w-4 h-4" />
                        {t.sidebar.settings}
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-border py-1">
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors disabled:opacity-50"
                      >
                        <LogOutIcon className="w-4 h-4" />
                        {isSigningOut ? "..." : (t.auth?.signOut || "Sign Out")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setShowSignInModal(true)}
                className="rounded-lg bg-accent hover:bg-accent-600 text-white shadow-md shadow-accent/20 hover:shadow-accent/30 transition-all duration-300 text-sm px-4 py-2"
              >
                {t.auth?.signIn || "Sign In"}
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            {currentUser && onTabChange && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XIcon className="w-5 h-5" />
                ) : (
                  <MenuIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {currentUser && onTabChange && isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface animate-slide-up">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
