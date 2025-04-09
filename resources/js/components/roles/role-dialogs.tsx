import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { router, usePage } from '@inertiajs/react';
import { Role, Permission } from '@/pages/roles/index';

// View Role Dialog
export function ViewRoleDialog({
  role,
  isOpen,
  onClose
}: {
  role: Role | null,
  isOpen: boolean,
  onClose: () => void
}) {
  // Safe guard against null role
  if (!role || !isOpen) return null;

  // Safely accessing properties with fallbacks
  const safeRole = {
    id: role?.id || '',
    name: role?.name || 'Unknown Role',
    guard_name: role?.guard_name || 'web',
    permissions: role?.permissions || [],
    created_at: role?.created_at || '',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Role Details</DialogTitle>
          <DialogDescription>
            Viewing information for role: {safeRole.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">ID</Label>
            <div className="col-span-3">{safeRole.id}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Name</Label>
            <div className="col-span-3">{safeRole.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Guard</Label>
            <div className="col-span-3">{safeRole.guard_name}</div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right">Permissions</Label>
            <div className="col-span-3">
              {safeRole.permissions.length > 0 ? (
                <div className="space-y-1">
                  {safeRole.permissions.map((permission) => (
                    <div key={permission.id} className="bg-muted px-3 py-1 rounded-md">
                      {permission.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No permissions assigned</div>
              )}
            </div>
          </div>
          {safeRole.created_at && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Created</Label>
              <div className="col-span-3">
                {(() => {
                  try {
                    return new Date(safeRole.created_at).toLocaleString();
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

// Edit Role Dialog
export function EditRoleDialog({
  role,
  isOpen,
  onClose
}: {
  role: Role | null,
  isOpen: boolean,
  onClose: () => void
}) {
  const props = usePage().props as { permissions?: Permission[] };
  const permissions = props.permissions || [];

  const [formData, setFormData] = useState<{
    name: string;
    permissions: string[];
  }>({
    name: '',
    permissions: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        permissions: role.permissions?.map(p => p.name) || [],
      });
    }
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionToggle = (permissionName: string) => {
    setFormData(prev => {
      const updatedPermissions = prev.permissions.includes(permissionName)
        ? prev.permissions.filter(p => p !== permissionName)
        : [...prev.permissions, permissionName];

      return {
        ...prev,
        permissions: updatedPermissions,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) return;

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Role name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    router.put(`/roles/${role.id}`, formData, {
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

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Make changes to role: {role.name}
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
              <Label className="text-right pt-2">Permissions</Label>
              <div className="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={formData.permissions.includes(permission.name)}
                      onCheckedChange={() => handlePermissionToggle(permission.name)}
                    />
                    <Label
                      htmlFor={`permission-${permission.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {permission.name}
                    </Label>
                  </div>
                ))}
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

// Create Role Dialog
export function CreateRoleDialog({
  isOpen,
  onClose
}: {
  isOpen: boolean,
  onClose: () => void
}) {
  const props = usePage().props as { permissions?: Permission[] };
  const permissions = props.permissions || [];

  const [formData, setFormData] = useState<{
    name: string;
    permissions: string[];
  }>({
    name: '',
    permissions: [],
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

  const handlePermissionToggle = (permissionName: string) => {
    setFormData(prev => {
      const updatedPermissions = prev.permissions.includes(permissionName)
        ? prev.permissions.filter(p => p !== permissionName)
        : [...prev.permissions, permissionName];

      return {
        ...prev,
        permissions: updatedPermissions,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form:", formData);

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Role name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    router.post('/roles', formData, {
      onSuccess: () => {
        console.log("Role created successfully");
        onClose();
        setFormData({
          name: '',
          permissions: [],
        });
        setIsSubmitting(false);
      },
      onError: (errors) => {
        console.error("Error creating role:", errors);
        setErrors(errors as Record<string, string>);
        setIsSubmitting(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Add a new role with permissions
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
              <Label className="text-right pt-2">Permissions</Label>
              <div className="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={formData.permissions.includes(permission.name)}
                      onCheckedChange={() => handlePermissionToggle(permission.name)}
                    />
                    <Label
                      htmlFor={`permission-${permission.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {permission.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Role Dialog
export function DeleteRoleDialog({
  role,
  isOpen,
  onClose,
  onConfirm
}: {
  role: Role | null,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void
}) {
  if (!role || !isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the role <strong>{role.name}</strong> and remove it from any assigned users.
            This action cannot be undone.
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
