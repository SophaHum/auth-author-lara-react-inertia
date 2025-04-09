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
    X,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  ViewUserDialog,
  EditUserDialog,
  CreateUserDialog,
  DeleteUserDialog,
} from '@/components/users/user-dialogs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [dateFilter, setDateFilter] = useState<{start?: string, end?: string}>({});

    // Dialog states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Simple table without complex features
    const [tableData, setTableData] = useState<User[]>([]);
    const [filteredData, setFilteredData] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Extract unique roles for filter dropdown
    const availableRoles = React.useMemo(() => {
        const roles = new Set<string>();
        tableData.forEach(user => {
            if (user.role) roles.add(user.role);
        });
        return Array.from(roles);
    }, [tableData]);

    // Safely process user data on mount only
    useEffect(() => {
        try {
            setIsLoading(true);
            const processedData = (users || []).map(user => ({
                id: String(user?.id || ''),
                name: String(user?.name || ''),
                email: String(user?.email || ''),
                role: String(user?.role || ''),
                created_at: String(user?.created_at || ''),
                updated_at: String(user?.updated_at || '')
            }));
            setTableData(processedData);
            setFilteredData(processedData);
            setIsLoading(false);
        } catch (error) {
            console.error("Error processing user data:", error);
            setTableData([]);
            setFilteredData([]);
            setIsLoading(false);
        }
    }, [users]);

    // Apply filters
    useEffect(() => {
        let result = [...tableData];

        // Text search filter
        if (searchFilter) {
            const searchLower = searchFilter.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            );
        }

        // Role filter
        if (roleFilter) {
            result = result.filter(user => user.role === roleFilter);
        }

        // Date range filter
        if (dateFilter.start) {
            result = result.filter(user => {
                if (!user.created_at) return false;
                const createdDate = new Date(user.created_at);
                return createdDate >= new Date(dateFilter.start!);
            });
        }

        if (dateFilter.end) {
            result = result.filter(user => {
                if (!user.created_at) return false;
                const createdDate = new Date(user.created_at);
                return createdDate <= new Date(dateFilter.end!);
            });
        }

        setFilteredData(result);
    }, [tableData, searchFilter, roleFilter, dateFilter]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [filteredData]);

    // Simplified columns without complex interactivity
    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'id',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue('email')}</div>,
        },
        {
            accessorKey: 'role',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Role
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const role = row.getValue('role') as string;
                if (!role) return <Badge variant="outline">No Role</Badge>;

                // Style the Admin role differently
                if (role === 'Admin') {
                    return <Badge variant="destructive">{role}</Badge>;
                }
                return <Badge variant="outline">{role}</Badge>;
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = row.getValue('created_at');
                if (!date) return <div>N/A</div>;
                try {
                    return <div>{new Date(date as string).toLocaleDateString()}</div>;
                } catch (e) {
                    return <div>Invalid date</div>;
                }
            },
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

    // Enhanced table configuration
    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            pagination: {
                pageIndex: currentPage,
                pageSize,
            },
        },
        enableSorting: true,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getSortedRowModel: getSortedRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // Reset all filters
    const resetFilters = () => {
        setSearchFilter("");
        setRoleFilter(null);
        setDateFilter({});
    };

    // Calculate pagination info
    const totalItems = filteredData.length;
    const pageCount = Math.ceil(totalItems / pageSize);
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

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

    // Add this function to explicitly toggle filter visibility
    const toggleFilters = () => {
        setFiltersExpanded(prev => !prev);
    };

    // In case of table error, show a simplified interface
    if (tableData.length === 0 && !isLoading) {
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
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Users</CardTitle>
                        <Button onClick={() => setCreateDialogOpen(true)} className="gap-1">
                            <UserPlus className="h-4 w-4" />
                            <span>Add User</span>
                        </Button>
                    </div>
                    <CardDescription>
                        {/* Manage your users. You can view, add, edit, or delete users. */}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Revised Filter Section with dark mode support */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className="w-[250px]"
                                />
                            </div>
                            <div className="flex items-center">
                                <Button
                                    variant={filtersExpanded ? "secondary" : "outline"}
                                    size="sm"
                                    className="gap-1"
                                    onClick={toggleFilters}
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
                                </Button>
                                {(searchFilter || roleFilter || dateFilter.start || dateFilter.end) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetFilters}
                                        className="ml-2 gap-1"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filter content with dark mode support */}
                        {filtersExpanded && (
                            <div className="space-y-4 bg-muted/50 dark:bg-muted/20 p-4 rounded-md mt-3 animate-in fade-in-50 duration-200 border border-border">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Role</label>
                                        <Select
                                            value={roleFilter ?? "all"}
                                            onValueChange={(value) => setRoleFilter(value === "all" ? null : value)}
                                        >
                                            <SelectTrigger className="bg-background">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Roles</SelectItem>
                                                {availableRoles.map((role) => (
                                                    <SelectItem key={role} value={role}>
                                                        {role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Date From</label>
                                        <Input
                                            type="date"
                                            value={dateFilter.start || ''}
                                            onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                                            className="bg-background"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Date To</label>
                                        <Input
                                            type="date"
                                            value={dateFilter.end || ''}
                                            onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                                            className="bg-background"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Filters with dark mode support */}
                    {(searchFilter || roleFilter || dateFilter.start || dateFilter.end) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {searchFilter && (
                                <Badge variant="secondary" className="gap-1 text-foreground bg-muted hover:bg-muted/80">
                                    Search: {searchFilter}
                                    <X
                                        className="h-3 w-3 cursor-pointer text-foreground/70 hover:text-foreground"
                                        onClick={() => setSearchFilter("")}
                                    />
                                </Badge>
                            )}
                            {roleFilter && (
                                <Badge variant="secondary" className="gap-1 text-foreground bg-muted hover:bg-muted/80">
                                    Role: {roleFilter}
                                    <X
                                        className="h-3 w-3 cursor-pointer text-foreground/70 hover:text-foreground"
                                        onClick={() => setRoleFilter(null)}
                                    />
                                </Badge>
                            )}
                            {dateFilter.start && (
                                <Badge variant="secondary" className="gap-1 text-foreground bg-muted hover:bg-muted/80">
                                    From: {dateFilter.start}
                                    <X
                                        className="h-3 w-3 cursor-pointer text-foreground/70 hover:text-foreground"
                                        onClick={() => setDateFilter({...dateFilter, start: undefined})}
                                    />
                                </Badge>
                            )}
                            {dateFilter.end && (
                                <Badge variant="secondary" className="gap-1 text-foreground bg-muted hover:bg-muted/80">
                                    To: {dateFilter.end}
                                    <X
                                        className="h-3 w-3 cursor-pointer text-foreground/70 hover:text-foreground"
                                        onClick={() => setDateFilter({...dateFilter, end: undefined})}
                                    />
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Table */}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="mt-2">Loading users...</p>
                            </div>
                        </div>
                    ) : (
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
                                                No users found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-0">
                    <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
                        Showing {totalItems > 0 ? startItem : 0} to {endItem} of {totalItems} entries
                    </div>

                    <div className="flex items-center space-x-6">
                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => setPageSize(Number(value))}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 / page</SelectItem>
                                <SelectItem value="10">10 / page</SelectItem>
                                <SelectItem value="25">25 / page</SelectItem>
                                <SelectItem value="50">50 / page</SelectItem>
                                <SelectItem value="100">100 / page</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(0)}
                                disabled={currentPage === 0}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm whitespace-nowrap">
                                Page {currentPage + 1} of {pageCount || 1}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage >= pageCount - 1}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(pageCount - 1)}
                                disabled={currentPage >= pageCount - 1}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>

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

