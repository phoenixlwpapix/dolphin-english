"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

type AuthMode = "signIn" | "signUp";

export function SignInForm({ onSuccess }: { onSuccess?: () => void }) {
    const { t } = useI18n();
    const { signIn } = useAuthActions();
    const [mode, setMode] = useState<AuthMode>("signIn");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);
            formData.append("flow", mode);

            await signIn("password", formData);
            onSuccess?.();
        } catch (err) {
            setError(
                mode === "signIn"
                    ? t.auth?.signInError || "Invalid email or password"
                    : t.auth?.signUpError || "Could not create account"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground ml-1"
                >
                    {t.auth?.email || "Email"}
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background/50 focus:bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    placeholder="you@example.com"
                />
            </div>

            <div className="space-y-1.5">
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground ml-1"
                >
                    {t.auth?.password || "Password"}
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background/50 focus:bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    placeholder="••••••••"
                />
            </div>

            {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50 animate-in fade-in slide-in-from-top-1">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full rounded-xl py-6 text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                isLoading={isLoading}
            >
                {mode === "signIn"
                    ? t.auth?.signIn || "Sign In"
                    : t.auth?.signUp || "Sign Up"}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
                {mode === "signIn" ? (
                    <>
                        {t.auth?.noAccount || "Don't have an account?"}{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setMode("signUp");
                                setError("");
                            }}
                            className="text-primary hover:text-primary-600 font-semibold transition-colors hover:underline underline-offset-4"
                        >
                            {t.auth?.signUp || "Sign Up"}
                        </button>
                    </>
                ) : (
                    <>
                        {t.auth?.hasAccount || "Already have an account?"}{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setMode("signIn");
                                setError("");
                            }}
                            className="text-primary hover:text-primary-600 font-semibold transition-colors hover:underline underline-offset-4"
                        >
                            {t.auth?.signIn || "Sign In"}
                        </button>
                    </>
                )}
            </div>
        </form>
    );
}
