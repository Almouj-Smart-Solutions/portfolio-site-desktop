"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      username: form.get("username"),
      password: form.get("password"),
      redirect: false,
    });
    setPending(false);
    if (!result || result.error) {
      setError("Those credentials were not accepted.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={onSubmit}>
        <div>
          <h1 className="admin-title">Admin</h1>
          <p className="admin-lead">Sign in to edit the portfolio.</p>
        </div>
        <label className="admin-field">
          Username
          <input name="username" autoComplete="username" required />
        </label>
        <label className="admin-field">
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error ? <p className="admin-error">{error}</p> : null}
        <button className="admin-btn primary" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
