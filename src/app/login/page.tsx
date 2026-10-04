import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/");
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
            L
          </div>
          <h1 className="text-2xl font-bold text-foreground">Lush Trade Corp</h1>
          <p className="text-secondary-foreground text-sm mt-1">
            Sign in to the AI Marketing Platform
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@lushtradecorp.com"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <button
            formAction={async (formData) => {
              "use server";
              const email = formData.get("email") as string;
              const password = formData.get("password") as string;
              const supabase = await createClient();
              const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (error) {
                return redirect("/login?message=Could not authenticate user");
              }
              return redirect("/");
            }}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-secondary-foreground">
          <p>This is an internal system. Access is restricted to authorized personnel only.</p>
        </div>
      </div>
    </div>
  );
}
