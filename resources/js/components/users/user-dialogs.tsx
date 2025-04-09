import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { router, usePage } from '@inertiajs/react';
import { User } from '@/pages/users/index';

// Type for roles
interface Role {
  id: number;
  name: string;
}

// Get roles from page props
function useRoles(): Role[] {
  const { roles = [] } = usePage().props as { roles?: Role[] };
  return roles;
}

// View User Dialog
export function ViewUserDialog({
  user,
  isOpen,
  onClose
}: {
  user: User | null,
  isOpen: boolean,
  onClose: () => void
}) {
  // Safe guard against null user
  if (!user || !isOpen) return null;

  // Safely accessing properties with fallbacks
  const safeUser = {
    id: user?.id || '',
    name: user?.name || 'Unknown User',
    email: user?.email || 'No email provided',
    role: user?.role || '',
    created_at: user?.created_at || '',
  };

  // Safe handler to prevent crashes
  const handleEditClick = () => {
    try {
      onClose();
      if (safeUser.id) {
        router.visit(`/users/${safeUser.id}/edit`);
      }
    } catch (error) {
      console.error("Error navigating to edit page:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Viewing information for {safeUser.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">ID</Label>
            <div className="col-span-3">{safeUser.id}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Name</Label>
            <div className="col-span-3">{safeUser.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Email</Label>
            <div className="col-span-3">{safeUser.email}</div>
          </div>
          {safeUser.role && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Role</Label>
              <div className="col-span-3">{safeUser.role}</div>
            </div>
          )}
          {safeUser.created_at && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Created</Label>
              <div className="col-span-3">
                {/* Safely parse date with error handling */}
                {(() => {
                  try {
                    return new Date(safeUser.created_at).toLocaleString();
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
          <Button variant="outline" onClick={handleEditClick}>Edit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Dialog
export function EditUserDialog({
  user,
  isOpen,
  onClose
}: {
  user: User | null,
  isOpen: boolean,
  onClose: () => void
}) {
  const roles = useRoles();
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: string;
  }>({
    name: '',
    email: '',
    role: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    router.put(`/users/${user.id}`, formData, {
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

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to {user.name}'s profile here
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
              <Label htmlFor="email" className="text-right">Email</Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <div className="col-span-3">
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="">No roles available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
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

// Create User Dialog
export function CreateUserDialog({
  isOpen,
  onClose
}: {
  isOpen: boolean,
  onClose: () => void
}) {
  const roles = useRoles();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    password_confirmation: '',
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

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Basic validation
      const newErrors: Record<string, string> = {};
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsSubmitting(true);

      router.post('/users', formData, {
        onSuccess: () => {
          try {
            onClose();
            setFormData({
              name: '',
              email: '',
              role: '',
              password: '',
              password_confirmation: '',
            });
          } catch (error) {
            console.error("Error resetting form:", error);
          } finally {
            setIsSubmitting(false);
          }
        },
        onError: (errors) => {
          try {
            setErrors(errors as Record<string, string>);
          } catch (error) {
            console.error("Error setting form errors:", error);
          } finally {
            setIsSubmitting(false);
          }
        }
      });
    } catch (error) {
      console.error("Form submission error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system
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
              <Label htmlFor="email" className="text-right">Email</Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <div className="col-span-3">
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="">No roles available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Password</Label>
              <div className="col-span-3">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password_confirmation" className="text-right">Confirm</Label>
              <div className="col-span-3">
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={errors.password_confirmation ? "border-red-500" : ""}
                />
                {errors.password_confirmation && (
                  <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete User Dialog
export function DeleteUserDialog({
  user,
  isOpen,
  onClose,
  onConfirm
}: {
  user: User | null,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void
}) {
  if (!user || !isOpen) return null;

  // Safely get user properties with fallbacks
  const userEmail = user?.email || 'No email';

  // Create a safe wrapper for the confirmation handler
  const handleConfirm = () => {
    try {
      onConfirm();
    } catch (error) {
      console.error("Error during delete confirmation:", error);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the user with email <strong>{userEmail}</strong>.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600"
            onClick={handleConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
