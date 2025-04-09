import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface Category {
  id: string;
  name: string;
  description: string;
  status: string;
  product_count: number;
  created_at: string;
  updated_at: string;
}

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryFormDialogProps extends CategoryDialogProps {
  category?: Category | null;
}

interface DeleteCategoryDialogProps extends CategoryDialogProps {
  category: Category | null;
  onConfirm: () => void;
}

export function ViewCategoryDialog({ category, isOpen, onClose }: CategoryFormDialogProps) {
  if (!category) return null;

  const formattedCreatedAt = category.created_at
    ? new Date(category.created_at).toLocaleDateString() + ' ' + new Date(category.created_at).toLocaleTimeString()
    : 'N/A';

  const formattedUpdatedAt = category.updated_at
    ? new Date(category.updated_at).toLocaleDateString() + ' ' + new Date(category.updated_at).toLocaleTimeString()
    : 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Category Details</DialogTitle>
          <DialogDescription>
            View details about this category.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">Name</Label>
            <div className="font-medium">{category.name}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-muted-foreground">Description</Label>
            <div className="font-medium">{category.description || 'No description provided'}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-muted-foreground">Status</Label>
            <div className="font-medium capitalize">{category.status}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product_count" className="text-muted-foreground">Product Count</Label>
            <div className="font-medium">{category.product_count}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="created_at" className="text-muted-foreground">Created At</Label>
              <div className="font-medium">{formattedCreatedAt}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="updated_at" className="text-muted-foreground">Updated At</Label>
              <div className="font-medium">{formattedUpdatedAt}</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateCategoryDialog({ isOpen, onClose }: CategoryDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Reset form whenever isOpen changes
  useEffect(() => {
    console.log("CreateCategoryDialog isOpen:", isOpen);
    if (isOpen) {
      setName('');
      setDescription('');
      setStatus('active');
      setError('');
      setProcessing(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setProcessing(true);
    setError('');

    console.log("Creating category:", { name, description, status });

    // Direct form submission to ensure the modal works correctly
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/categories';

    // Add CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = '_token';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
    }

    // Add form data
    const nameInput = document.createElement('input');
    nameInput.type = 'hidden';
    nameInput.name = 'name';
    nameInput.value = name;
    form.appendChild(nameInput);

    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'hidden';
    descriptionInput.name = 'description';
    descriptionInput.value = description;
    form.appendChild(descriptionInput);

    const statusInput = document.createElement('input');
    statusInput.type = 'hidden';
    statusInput.name = 'status';
    statusInput.value = status;
    form.appendChild(statusInput);

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your products.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditCategoryDialog({ category, isOpen, onClose }: CategoryFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Synchronize the dialog state with the isOpen prop
  useEffect(() => {
    if (isOpen && category) {
      setDialogOpen(true);
      setName(category.name || '');
      setDescription(category.description || '');
      setStatus(category.status || 'active');
      setError('');
      setProcessing(false);
    }
  }, [category, isOpen]);

  // Handle dialog close
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      onClose();
    }
  };

  if (!category) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    router.put(`/categories/${category.id}`, {
      name,
      description,
      status
    }, {
      preserveState: false,
      preserveScroll: true,
      onSuccess: () => {
        setProcessing(false);
        handleOpenChange(false);
        // Force reload to update the table
        window.location.href = '/categories';
      },
      onError: (errors) => {
        setProcessing(false);
        console.error("Category update errors:", errors);

        if (typeof errors === 'object' && errors !== null) {
          const errorMessage = Object.values(errors)[0];
          setError(Array.isArray(errorMessage) ? errorMessage[0] : String(errorMessage));
        } else {
          setError('Failed to update category');
        }
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the information for this category.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Updating...' : 'Update Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteCategoryDialog({ category, isOpen, onClose, onConfirm }: DeleteCategoryDialogProps) {
  if (!category) return null;

  const [processing, setProcessing] = useState(false);

  const handleDelete = () => {
    setProcessing(true);
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this category? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are about to delete the category "{category.name}".
              {category.product_count > 0 && (
                <span className="font-semibold block mt-2">
                  Warning: This category has {category.product_count} associated products
                  which might be affected by this action.
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={processing}
          >
            {processing ? 'Deleting...' : 'Delete Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
