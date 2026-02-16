'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Filter } from 'lucide-react';

type Link = {
  id: number;
  created_at: string;
  title: string;
  link: string;
  group_type: 'SOCIAL' | 'MATERIAL' | 'TEST' | 'FORM' | 'MISC' | 'DEV';
};

const LINK_GROUP_OPTIONS = ['SOCIAL', 'MATERIAL', 'TEST', 'FORM', 'MISC', 'DEV'] as const;

type LinkFormData = {
  title: string;
  link: string;
  group_type: 'SOCIAL' | 'MATERIAL' | 'TEST' | 'FORM' | 'MISC' | 'DEV';
};

export default function LinkManagementPanel() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<LinkFormData>({
    title: '',
    link: '',
    group_type: 'DEV'
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const itemsPerPage = 5;

  // Fetch all links
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin/api/link/list-link');
      const result = await response.json();
      
      if (result.data) {
        setLinks(result.data);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
      alert('Failed to fetch links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new link
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/admin/api/link/add-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Link added successfully!');
        setFormData({
          title: '',
          link: '',
          group_type: 'DEV'
        });
        setDialogOpen(false);
        fetchLinks();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error adding link:', error);
      alert('Failed to add link');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit link
  const handleEditLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setSubmitting(true);

    try {
      const response = await fetch('/admin/api/link/edit-link', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId,
          ...formData
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Link updated successfully!');
        setFormData({
          title: '',
          link: '',
          group_type: 'DEV'
        });
        setEditingId(null);
        setDialogOpen(false);
        fetchLinks();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating link:', error);
      alert('Failed to update link');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete link
  const handleDeleteLink = async (id: number) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const response = await fetch(`/admin/api/link/delete-link?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        alert('Link deleted successfully!');
        fetchLinks();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link');
    }
  };

  // Load link data into form for editing
  const handleStartEdit = (link: Link) => {
    setEditingId(link.id);
    setFormData({
      title: link.title,
      link: link.link,
      group_type: link.group_type
    });
    setDialogOpen(true);
  };
  
  // Open dialog for creating new link
  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      title: '',
      link: '',
      group_type: 'DEV'
    });
    setDialogOpen(true);
  };

  // Filter and pagination logic
  const filteredLinks = groupFilter === 'ALL' 
    ? links 
    : links.filter(link => link.group_type === groupFilter);
  
  // Sort by created_at date
  const sortedLinks = [...filteredLinks].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });
  
  const totalPages = Math.ceil(sortedLinks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLinks = sortedLinks.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [groupFilter]);
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Link Management Panel</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNew}>+ Link</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Link' : 'Create New Link'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the link details below' : 'Fill in the details to create a new link'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editingId ? handleEditLink : handleAddLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter link title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  name="link"
                  type="url"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group_type">Group Type</Label>
                <select
                  id="group_type"
                  name="group_type"
                  value={formData.group_type}
                  onChange={handleInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  required
                >
                  {LINK_GROUP_OPTIONS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Processing...' : editingId ? 'Update Link' : 'Create Link'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-4 mb-4">
        <Label htmlFor="group-filter" className="font-semibold">Filter by Group:</Label>
        <select
          id="group-filter"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="flex h-9 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          <option value="ALL">All Groups</option>
          {LINK_GROUP_OPTIONS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
        </Button>
      </div>

      {/* Links Table */}
      <div className="rounded-md border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading links...</div>
        ) : filteredLinks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {groupFilter === 'ALL' ? 'No links found. Create your first link!' : `No links with group "${groupFilter}" found.`}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center"><strong>Title</strong></TableHead>
                  <TableHead className="text-center"><strong>Link</strong></TableHead>
                  <TableHead className="text-center"><strong>Group Type</strong></TableHead>
                  <TableHead className="text-center"><strong>Actions</strong></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium text-center">{link.title}</TableCell>
                    <TableCell className="text-center">
                      <a 
                        href={link.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {link.link}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{link.group_type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStartEdit(link)}>
                            Edit Link
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            Delete Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Page</span>
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="flex h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>
                        {page}
                      </option>
                    ))}
                  </select>
                  <span>of {totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
