import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon, UserPlus, UserMinus, LayoutDashboard } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/admin/auth/login");
  }

  return JSON.stringify(data.claims, null, 2);
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated Admin
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="text-2xl font-semibold mb-4">Admin Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <Button asChild variant="default" size="lg">
            <Link href="/admin/panel" className="flex items-center gap-2">
              <LayoutDashboard size="20" />
              Admin Panel
            </Link>
          </Button>
          <Button asChild variant="default" size="lg">
            <Link href="/admin/grant" className="flex items-center gap-2">
              <UserPlus size="20" />
              Grant Admin Access
            </Link>
          </Button>
          <Button asChild variant="destructive" size="lg">
            <Link href="/admin/remove" className="flex items-center gap-2">
              <UserMinus size="20" />
              Remove Admin Access
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
