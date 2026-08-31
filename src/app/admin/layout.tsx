import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@/components/admin/ThemeProvider";
import { AdminSessionProvider } from "@/components/admin/AdminSessionContext";
import AdminShell from "@/components/admin/AdminShell";
import { requireUser } from "@/lib/server-auth";
import "@/styles/admin-theme.css";

const EDITOR_FORBIDDEN_PREFIXES = [
  "/admin/users",
  "/admin/settings",
  "/admin/appearance",
  "/admin/homepage",
  "/admin/tools",
  "/admin/ads",
];

const WRITER_FORBIDDEN_PREFIXES = [
  "/admin/users",
  "/admin/settings",
  "/admin/appearance",
  "/admin/homepage",
  "/admin/tools",
  "/admin/ads",
  "/admin/pages",
  "/admin/categories",
  "/admin/analytics",
];

function getForbiddenPrefixes(role: string | null) {
  if (!role || role === "SUPER_ADMIN" || role === "ADMIN") return [];
  if (role === "EDITOR") return EDITOR_FORBIDDEN_PREFIXES;
  return WRITER_FORBIDDEN_PREFIXES;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-admin-pathname") || "/admin";
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const user = await requireUser();
  if (!user) {
    redirect("/admin/login");
  }

  const forbiddenPrefixes = getForbiddenPrefixes(user.role || null);
  if (forbiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    redirect("/admin/dashboard");
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var cookieTheme = null;
                try {
                  var parts = document.cookie ? document.cookie.split(';') : [];
                  for (var i = 0; i < parts.length; i++) {
                    var p = parts[i].trim();
                    if (p.indexOf('admin-theme=') === 0) {
                      cookieTheme = decodeURIComponent(p.substring('admin-theme='.length));
                      break;
                    }
                  }
                } catch (e) {}
                var storedTheme = cookieTheme || localStorage.getItem('admin-theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `,
        }}
      />
      <ThemeProvider>
        <AdminSessionProvider
          initialUser={{
            id: user.id,
            name: user.name ?? null,
            email: user.email ?? null,
            role: user.role ?? null,
            status: user.status ?? null,
            avatar: user.avatar ?? null,
          }}
        >
          <AdminShell role={user.role ?? null}>
            {children}
          </AdminShell>
        </AdminSessionProvider>
      </ThemeProvider>
    </>
  );
}
