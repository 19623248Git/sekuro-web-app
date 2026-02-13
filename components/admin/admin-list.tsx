"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Admin {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: {
    role?: string;
  };
}

const PROTECTED_EMAIL = "sekuroheadmaster@gmail.com";

export function AdminList() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setCurrentUserEmail(data.user.email || null);
    }
  };

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/admin/api/list-admins');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch admins');
      }

      setAdmins(data.admins || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isUndeletable = (email: string) => {
    return email === PROTECTED_EMAIL || email === currentUserEmail;
  };

  const handleDelete = async (adminId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete admin: ${email}?`)) {
      return;
    }

    try {
      setDeletingId(adminId);
      const response = await fetch('/admin/api/delete-admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete admin');
      }

      // Refresh the list
      await fetchAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete admin');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchAdmins();
  }, []);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Admin Accounts</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Admin Accounts</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Admin Accounts</CardTitle>
        <CardDescription>
          {admins.length} {admins.length === 1 ? 'administrator' : 'administrators'} in the system
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No admins found</p>
          ) : (
            admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{admin.email}</p>
                    {admin.email === PROTECTED_EMAIL && (
                      <Badge variant="secondary">Protected</Badge>
                    )}
                    {admin.email === currentUserEmail && (
                      <Badge variant="outline">You</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(admin.id, admin.email)}
                  disabled={deletingId === admin.id || isUndeletable(admin.email)}
                  title={
                    isUndeletable(admin.email)
                      ? admin.email === PROTECTED_EMAIL
                        ? "This account is protected and cannot be deleted"
                        : "You cannot delete your own account"
                      : undefined
                  }
                >
                  {deletingId === admin.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
