"use client"
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { 
    ArrowUpDown, 
    Eye, 
    Pencil, 
    Trash, 
    UserPlus, 
    Search,
    MoreHorizontal 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as React from 'react';
import { useState, useEffect, Component, type ErrorInfo, type ReactNode } from 'react';
import {
  ViewUserDialog,
  EditUserDialog,
  CreateUserDialog,
  DeleteUserDialog,
} from '@/components/users/user-dialogs';

// Simplified user schema

import { ErrorBag, Errors } from '@inertiajs/core';

type PageProps = {
    users: any[];
    errors: Errors & ErrorBag;
    deferred?: Record<string, string[] | undefined>;
}

export type User = {
    id: string;
    name: string;
    email: string;
    username?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
};

// User component as default export
export default function UserIndex() {
    // Use a try-catch block for initial data processing
    try {
        const pageData = usePage().props as PageProps;
        const users = Array.isArray(pageData.users) ? pageData.users : [];
        
        const breadcrumbs: BreadcrumbItem[] = [
            { title: 'Users', href: '/users' },
        ];

        // Simple error boundary
        const [hasError, setHasError] = useState(false);
        
        useEffect(() => {
            // Reset error state when component mounts or users change
            setHasError(false);
        }, []);

        if (hasError) {
            return (
                <AppLayout breadcrumbs={breadcrumbs}>
                    <div>
                        <div>Something went wrong. Please try refreshing the page.</div>
                        <Button 
                            onClick={() => window.location.reload()}
                            className="ml-4"
                        >
                            Refresh
                        </Button>
                    </div>
                </AppLayout>
            );
        }
        
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Users" />
                <div className="w-full">
                    <UserTable users={users} />
                </div>
            </AppLayout>
        );
    } catch (error) {
        console.error("Failed to render UserIndex:", error);
        return (
            <div className="p-4">
                <h1 className="text-xl font-bold">Error Loading Users</h1>
                <p className="my-2">There was a problem loading this page. Please try reloading.</p>
                <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded" 
                    onClick={() => window.location.reload()}
                >
                    Reload Page
                </button>
            </div>
        );
    }
}

// Simplified UserTable component
function UserTable({ users }: { users: any[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [searchFilter, setSearchFilter] = useState("");

    // Dialog states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Simple table without complex features
    const [tableData, setTableData] = useState<User[]>([]);
    
    // Safely process user data on mount only
    useEffect(() => {
        try {
            const processedData = (users || []).map(user => ({
                id: String(user?.id || ''),
                name: String(user?.name || ''),
                email: String(user?.email || ''),
                username: String(user?.username || ''),
                role: String(user?.role || ''),
                created_at: String(user?.created_at || ''),
                updated_at: String(user?.updated_at || '')
            }));
            setTableData(processedData);
        } catch (error) {
            console.error("Error processing user data:", error);
            setTableData([]);
        }
    }, [users]);

    // Simplified columns without complex interactivity
    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => <div>{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => <div>{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => <div>{row.getValue('email')}</div>,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const user = row.original;
                
                return (
                    <div className="flex items-center justify-end space-x-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleView(user.id)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            title="View User"
                        >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(user.id)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
                            title="Edit User"
                        >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(user.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                            title="Delete User"
                        >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    // Simplified table configuration
    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // Action handlers
    const handleView = (id: string) => {
        try {
            const user = tableData.find(user => user.id === id);
            if (user) {
                setSelectedUser(user);
                setViewDialogOpen(true);
            }
        } catch (error) {
            console.error("Error opening View dialog:", error);
        }
    };

    const handleEdit = (id: string) => {
        try {
            const user = tableData.find(user => user.id === id);
            if (user) {
                setSelectedUser(user);
                setEditDialogOpen(true);
            }
        } catch (error) {
            console.error("Error opening Edit dialog:", error);
        }
    };

    const handleDelete = (id: string) => {
        try {
            const user = tableData.find(user => user.id === id);
            if (user) {
                setSelectedUser(user);
                setDeleteDialogOpen(true);
            }
        } catch (error) {
            console.error("Error opening Delete dialog:", error);
        }
    };

    const confirmDelete = () => {
        try {
            if (!selectedUser) return;
            
            router.delete(`/users/${selectedUser.id}`, {
                onSuccess: () => {
                    try {
                        setDeleteDialogOpen(false);
                        setSelectedUser(null);
                    } catch (error) {
                        console.error("Error cleaning up after delete:", error);
                    }
                },
                onError: (errors) => {
                    console.error("Delete failed:", errors);
                    setDeleteDialogOpen(false);
                }
            });
        } catch (error) {
            console.error("Error during delete:", error);
            setDeleteDialogOpen(false);
        }
    };

    // In case of table error, show a simplified interface
    if (tableData.length === 0) {
        return (
            <div className="p-4 border rounded">
                <p>No users found or error loading users.</p>
                <Button onClick={() => window.location.reload()} className="mt-2">
                    Reload
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchFilter}
                        onChange={(e) => {
                            setSearchFilter(e.target.value);
                        }}
                        className="pl-8 max-w-sm"
                    />
                </div>
                
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-1">
                    <UserPlus className="h-4 w-4" />
                    <span>Add User</span>
                </Button>
            </div>

            {/* Simplified table structure */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>

            {/* Dialogs without error boundaries */}
            {viewDialogOpen && (
                <ViewUserDialog 
                    user={selectedUser} 
                    isOpen={viewDialogOpen} 
                    onClose={() => setViewDialogOpen(false)} 
                />
            )}
            
            {editDialogOpen && (
                <EditUserDialog 
                    user={selectedUser} 
                    isOpen={editDialogOpen} 
                    onClose={() => setEditDialogOpen(false)} 
                />
            )}
            
            {createDialogOpen && (
                <CreateUserDialog 
                    isOpen={createDialogOpen} 
                    onClose={() => setCreateDialogOpen(false)} 
                />
            )}
            
            {deleteDialogOpen && (
                <DeleteUserDialog 
                    user={selectedUser} 
                    isOpen={deleteDialogOpen} 
                    onClose={() => setDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
}

