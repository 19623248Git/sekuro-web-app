import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Link as LinkIcon } from "lucide-react";

export default function PanelPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage your events and links</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-6 w-6" />
              <CardTitle>Event Management</CardTitle>
            </div>
            <CardDescription>
              Create, edit, and manage events. View upcoming events and track their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/panel/event">
                Manage Events
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="h-6 w-6" />
              <CardTitle>Link Management</CardTitle>
            </div>
            <CardDescription>
              Create, edit, and manage links. Organize and maintain your link collection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/panel/link">
                Manage Links
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
