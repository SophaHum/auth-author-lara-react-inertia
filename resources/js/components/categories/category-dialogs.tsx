import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { router } from '@inertiajs/react';

// Type interfaces
export interface Category {
  id: string;
  name: string;
  description?: string;
  status: string;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

// View Category Dialog
export function ViewCategoryDialog({
  category,
  isOpen,
  onClose
}: {
  category: Category | null,
  isOpen: boolean,
  onClose: () => void
}) {
  // Safe guard against null category
  if (!category || !isOpen) return null;

  // Safely accessing properties with fallbacks
  const safeCategory = {
    id: category?.id || '',
    name: category?.name || 'Unknown Category',
    description: category?.description || 'No description provided',
    status: category?.status || 'active',
    product_count: category?.product_count || 0,
    created_at: category?.created_at || '',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Category Details</DialogTitle>
          <DialogDescription>
            Viewing information for category: {safeCategory.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">ID</Label>
            <div className="col-span-3">{safeCategory.id}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Name</Label>
            <div className="col-span-3">{safeCategory.name}</div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right">Description</Label>
            <div className="col-span-3">{safeCategory.description}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <div className="col-span-3">
              <span className={`capitalize px-2 py-1 rounded-full text-xs ${
                safeCategory.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {safeCategory.status}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Products</Label>
            <div className="col-span-3">{safeCategory.product_count}</div>
          </div>
          {safeCategory.created_at && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Created</Label>
              <div className="col-span-3">
                {(() => {
                  try {
                    return new Date(safeCategory.created_at).toLocaleString();
                  } catch (e) {
                    return 'Invalid date';
                  }
                })()}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Category Dialog
export function EditCategoryDialog({
  category,
  isOpen,
  onClose
}: {
  category: Category | null,
  isOpen: boolean,
  onClose: () => void
}) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    status: string;
  }>({
    name: '',
    description: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'active',
      });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
    if (errors.status) {
      setErrors(prev => ({ ...prev, status: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) return;

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    router.put(`/categories/${category.id}`, formData, {
      onSuccess: () => {
        onClose();
        setIsSubmitting(false);
      },
      onError: (errors) => {
        setErrors(errors as Record<string, string>);
        setIsSubmitting(false);
      }
    });
  };

  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Make changes to category: {category.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <div className="col-span-3">
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Create Category Dialog
export function CreateCategoryDialog({
  isOpen,
  onClose
}: {
  isOpen: boolean,
  onClose: () => void
}) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    status: string;
  }>({
    name: '',
    description: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
    if (errors.status) {
      setErrors(prev => ({ ...prev, status: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    router.post('/categories', formData, {
      onSuccess: () => {
        onClose();
        setFormData({
          name: '',
          description: '',
          status: 'active',
        });
        setIsSubmitting(false);
      },
      onError: (errors) => {
        setErrors(errors as Record<string, string>);
        setIsSubmitting(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category for your products
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="e.g. Electronics"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                  placeholder="Description of this category"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <div className="col-span-3">
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Category Dialog
export function DeleteCategoryDialog({
  category,
  isOpen,
  onClose,
  onConfirm
}: {
  category: Category | null,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void
}) {
  if (!category || !isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the category <strong>{category.name}</strong>.
            {category.product_count && category.product_count > 0 ? (
              <p className="text-red-500 font-semibold mt-2">
                Warning: This category contains {category.product_count} products. Deleting it may affect these products.
              </p>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600"
            onClick={onConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
