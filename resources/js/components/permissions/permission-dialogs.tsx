import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { router } from '@inertiajs/react';
import { Permission } from '@/pages/permissions/index';

// View Permission Dialog
export function ViewPermissionDialog({
  permission,
  isOpen,
  onClose
}: {
  permission: Permission | null,
  isOpen: boolean,
  onClose: () => void
}) {
  // Safe guard against null permission
  if (!permission || !isOpen) return null;

  // Safely accessing properties with fallbacks
  const safePermission = {
    id: permission?.id || '',
    name: permission?.name || 'Unknown Permission',
    guard_name: permission?.guard_name || 'web',
    created_at: permission?.created_at || '',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Permission Details</DialogTitle>
          <DialogDescription>
            Viewing information for permission: {safePermission.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">ID</Label>
            <div className="col-span-3">{safePermission.id}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Name</Label>
            <div className="col-span-3">{safePermission.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Guard</Label>
            <div className="col-span-3">{safePermission.guard_name}</div>
          </div>
          {safePermission.created_at && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Created</Label>
              <div className="col-span-3">
                {(() => {
                  try {
                    return new Date(safePermission.created_at).toLocaleString();
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

// Edit Permission Dialog
export function EditPermissionDialog({
  permission,
  isOpen,
  onClose
}: {
  permission: Permission | null,
  isOpen: boolean,
  onClose: () => void
}) {
  const [formData, setFormData] = useState<{
    name: string;
    guard_name: string;
  }>({
    name: '',
    guard_name: 'web',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name || '',
        guard_name: permission.guard_name || 'web',
      });
    }
  }, [permission]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGuardChange = (value: string) => {
    setFormData(prev => ({ ...prev, guard_name: value }));
    if (errors.guard_name) {
      setErrors(prev => ({ ...prev, guard_name: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!permission) return;

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Permission name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    router.put(`/permissions/${permission.id}`, formData, {
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

  if (!permission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Permission</DialogTitle>
          <DialogDescription>
            Make changes to permission: {permission.name}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guard_name" className="text-right">Guard</Label>
              <div className="col-span-3">
                <Select
                  value={formData.guard_name}
                  onValueChange={handleGuardChange}
                >
                  <SelectTrigger className={errors.guard_name ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select guard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="sanctum">Sanctum</SelectItem>
                  </SelectContent>
                </Select>
                {errors.guard_name && <p className="text-red-500 text-sm mt-1">{errors.guard_name}</p>}
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

// Create Permission Dialog
export function CreatePermissionDialog({
  isOpen,
  onClose
}: {
  isOpen: boolean,
  onClose: () => void
}) {
  const [formData, setFormData] = useState<{
    name: string;
    guard_name: string;
  }>({
    name: '',
    guard_name: 'web',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGuardChange = (value: string) => {
    setFormData(prev => ({ ...prev, guard_name: value }));
    if (errors.guard_name) {
      setErrors(prev => ({ ...prev, guard_name: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Permission name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    router.post('/permissions', formData, {
      onSuccess: () => {
        onClose();
        setFormData({
          name: '',
          guard_name: 'web',
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
          <DialogTitle>Create New Permission</DialogTitle>
          <DialogDescription>
            Add a new permission to the system
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
                  placeholder="e.g. product-list"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guard_name" className="text-right">Guard</Label>
              <div className="col-span-3">
                <Select
                  value={formData.guard_name}
                  onValueChange={handleGuardChange}
                >
                  <SelectTrigger className={errors.guard_name ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select guard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="sanctum">Sanctum</SelectItem>
                  </SelectContent>
                </Select>
                {errors.guard_name && <p className="text-red-500 text-sm mt-1">{errors.guard_name}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Permission Dialog
export function DeletePermissionDialog({
  permission,
  isOpen,
  onClose,
  onConfirm
}: {
  permission: Permission | null,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void
}) {
  if (!permission || !isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the permission <strong>{permission.name}</strong>.
            This action cannot be undone and may impact roles that use this permission.
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
