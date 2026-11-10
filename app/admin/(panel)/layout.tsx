import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { auth, signOut } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">Admin panel</div>
        <AdminNav />
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <Link href="/">Portfolio</Link>
          <form action={logout}>
            <button className="admin-btn" type="submit">
              Sign out
            </button>
          </form>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
