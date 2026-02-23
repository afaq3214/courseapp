"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validatePassword(pw: string) {
    if (pw.length < 8) return "Password must be at least 8 characters.";
    if (!/[a-z]/.test(pw)) return "Password must include a lowercase letter.";
    if (!/[A-Z]/.test(pw)) return "Password must include an uppercase letter.";
    if (!/[0-9]/.test(pw)) return "Password must include a number.";
    if (!/[^A-Za-z0-9]/.test(pw)) return "Password must include a symbol.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            phone,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: session.user.id,
          username,
          phone: phone.trim() ? phone : null,
        });

        if (profileError) {
          setError(profileError.message);
          return;
        }
      }

      router.replace("/courses");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-20">
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Email + password.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Username</span>
                <input
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-violet-400 dark:border-zinc-800 dark:bg-zinc-950"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  autoComplete="username"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Phone (optional)</span>
                <input
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-violet-400 dark:border-zinc-800 dark:bg-zinc-950"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Email</span>
                <input
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-violet-400 dark:border-zinc-800 dark:bg-zinc-950"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Password</span>
                <div className="relative">
                  <input
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-violet-400 dark:border-zinc-800 dark:bg-zinc-950 w-full"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
                    title="Must contain at least 8 characters, including uppercase, lowercase, number, and special character"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Must contain: 8+ chars, uppercase, lowercase, number, and special character
                </div>
              </label>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              ) : null}

              <Button variant="gradient" disabled={loading} type="submit">
                {loading ? "Creating…" : "Sign up"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
          Already have an account?{" "}
          <Link className="text-violet-600 hover:text-violet-700 underline font-medium" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
