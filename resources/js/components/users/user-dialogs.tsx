import * as React from 'react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { User, Role } from '@/pages/users/index';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form validation schema for user creation
const createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.string().optional(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

// Form validation schema for user editing
const editUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().optional(),
    role: z.string().optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

// View User Dialog
export function ViewUserDialog({
    user,
    isOpen,
    onClose
}: {
    user: User,
    isOpen: boolean,
    onClose: () => void
}) {
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            setLoading(true);
            fetch(`/users/${user.id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load user details');
                    }
                    return response.json();
                })
                .then(data => {
                    setUserData(data.user);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching user:', err);
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [isOpen, user]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>View User</DialogTitle>
                    <DialogDescription>
                        User information and assigned roles.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-2">Loading user details...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">
                        {error}
                    </div>
                ) : userData ? (
                    <ScrollArea className="max-h-[70vh]">
                        <div className="space-y-6 px-1 py-2">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-foreground">Name</h4>
                                <p className="text-sm text-muted-foreground">{userData.name}</p>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-foreground">Email</h4>
                                <p className="text-sm text-muted-foreground">{userData.email}</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-foreground">Roles</h4>
                                {userData.roles && userData.roles.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {userData.roles.map(role => (
                                            <Badge key={role.id} variant="outline">
                                                {role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No roles assigned</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-foreground">Created At</h4>
                                <p className="text-sm text-muted-foreground">
                                    {userData.created_at ? new Date(userData.created_at).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-muted-foreground text-center py-4">
                        User data not available
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Edit User Dialog
export function EditUserDialog({
    user,
    roles,
    isOpen,
    onClose
}: {
    user: User,
    roles: Role[],
    isOpen: boolean,
    onClose: () => void
}) {
    const form = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles.length > 0 ? user.roles[0].id : undefined,
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    function onSubmit(data: EditUserFormValues) {
        setIsSubmitting(true);

        // Map form data to the expected format for the API
        const formData = {
            name: data.name,
            email: data.email,
            roles: [data.role], // Send the role as an array
            ...(data.password ? { password: data.password } : {}),
        };

        router.put(`/users/${user.id}`, formData, {
            onSuccess: () => {
                form.reset();
                onClose();
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error('Update errors:', errors);
                setIsSubmitting(false);
                Object.keys(errors).forEach(key => {
                    form.setError(key as keyof EditUserFormValues, {
                        type: 'manual',
                        message: errors[key] as string
                    });
                });
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user information and roles.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Email address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password (Leave blank to keep current)</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="New password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {roles.map(role => (
                                                <SelectItem key={role.id} value={role.id}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Updating...' : 'Update User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// Create User Dialog - with empty form and dropdown for role selection
export function CreateUserDialog({
    roles,
    isOpen,
    onClose
}: {
    roles: Role[],
    isOpen: boolean,
    onClose: () => void
}) {
    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: undefined,
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when dialog opens
    useEffect(() => {
        if (isOpen) {
            form.reset({
                name: '',
                email: '',
                password: '',
                role: undefined,
            });
        }
    }, [isOpen, form]);

    function onSubmit(data: CreateUserFormValues) {
        setIsSubmitting(true);

        // Map form data to the expected format for the API
        const formData = {
            name: data.name,
            email: data.email,
            password: data.password,
            roles: data.role ? [data.role] : [], // Send the role as an array
        };

        router.post('/users', formData, {
            onSuccess: () => {
                form.reset();
                onClose();
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error('Create errors:', errors);
                setIsSubmitting(false);
                Object.keys(errors).forEach(key => {
                    form.setError(key as keyof CreateUserFormValues, {
                        type: 'manual',
                        message: errors[key] as string
                    });
                });
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Add a new user and assign a role.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Email address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {roles.map(role => (
                                                <SelectItem key={role.id} value={role.id}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
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
    user: User,
    isOpen: boolean,
    onClose: () => void,
    onConfirm: () => void
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium">Name</h4>
                        <p className="text-sm text-muted-foreground">{user.name}</p>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium">Email</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium">Roles</h4>
                        <div className="flex flex-wrap gap-2">
                            {user.roles?.length > 0 ? (
                                user.roles.map(role => (
                                    <Badge key={role.id} variant="outline">
                                        {role.name}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">No roles assigned</span>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm}>
                        Delete User
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
