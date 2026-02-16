import Link from "next/link";
import { Button } from ".././ui/button";
import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "./admin_logout-button";

export async function AdminAuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      Welcome to the Admin Page, <strong>{user.email}</strong>
      <AdminLogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/admin/auth/login">Sign in</Link>
      </Button>
    </div>
  );
}
