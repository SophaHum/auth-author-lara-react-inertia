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
    PlusCircle,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    SlidersHorizontal,
    X,
    ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as React from 'react';
import { useState, useEffect } from 'react';
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
import {
    ViewPermissionDialog,
    EditPermissionDialog,
    CreatePermissionDialog,
    DeletePermissionDialog,
} from '@/components/permissions/permission-dialogs';

// TypeScript interfaces
export interface Permission {
    id: string;
    name: string;
    guard_name: string;
    created_at?: string;
    updated_at?: string;
}

type PageProps = {
    permissions: Permission[];
    errors: Errors & ErrorBag;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permissions',
        href: '/permissions',
    },
];

export default function Permissions() {
    const pageData = usePage().props as PageProps;

    // Add debugging to see what data is coming from the backend
    console.log('Permissions page data:', pageData);

    const permissions = Array.isArray(pageData.permissions) ? pageData.permissions : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions" />
            <div className="w-full">
                <PermissionsTable permissions={permissions} />
            </div>
        </AppLayout>
    );
}

function PermissionsTable({ permissions }: { permissions: Permission[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [searchFilter, setSearchFilter] = useState("");
    const [guardFilter, setGuardFilter] = useState<string | null>(null);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // Dialog states
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Table data state
    const [tableData, setTableData] = useState<Permission[]>([]);
    const [filteredData, setFilteredData] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Extract unique guard names for filter dropdown
    const availableGuards = React.useMemo(() => {
        const guards = new Set<string>();
        tableData.forEach(permission => {
            if (permission.guard_name) guards.add(permission.guard_name);
        });
        return Array.from(guards);
    }, [tableData]);

    // Process initial data
    useEffect(() => {
        try {
            setIsLoading(true);
            const processedData = (permissions || []).map(permission => ({
                id: String(permission?.id || ''),
                name: String(permission?.name || ''),
                guard_name: String(permission?.guard_name || ''),
                created_at: String(permission?.created_at || ''),
                updated_at: String(permission?.updated_at || '')
            }));
            setTableData(processedData);
            setFilteredData(processedData);
            setIsLoading(false);
        } catch (error) {
            console.error("Error processing permission data:", error);
            setTableData([]);
            setFilteredData([]);
            setIsLoading(false);
        }
    }, [permissions]);

    // Apply filters
    useEffect(() => {
        let result = [...tableData];

        // Text search filter
        if (searchFilter) {
            const searchLower = searchFilter.toLowerCase();
            result = result.filter(permission =>
                permission.name.toLowerCase().includes(searchLower)
            );
        }

        // Guard filter
        if (guardFilter) {
            result = result.filter(permission => permission.guard_name === guardFilter);
        }

        setFilteredData(result);
    }, [tableData, searchFilter, guardFilter]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [filteredData]);

    const columns: ColumnDef<Permission>[] = [
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
            accessorKey: 'guard_name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Guard
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div>
                    <Badge variant="outline">{row.getValue('guard_name') || 'default'}</Badge>
                </div>
            ),
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
                const permission = row.original;

                return (
                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(permission.id)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            title="View Permission"
                        >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(permission.id)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
                            title="Edit Permission"
                        >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(permission.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                            title="Delete Permission"
                        >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

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
        setGuardFilter(null);
    };

    // Toggle filters visibility
    const toggleFilters = () => {
        setFiltersExpanded(prev => !prev);
    };

    // Calculate pagination info
    const totalItems = filteredData.length;
    const pageCount = Math.ceil(totalItems / pageSize);
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

    // Action handlers
    const handleView = (id: string) => {
        try {
            const permission = tableData.find(permission => permission.id === id);
            if (permission) {
                setSelectedPermission(permission);
                setViewDialogOpen(true);
            }
        } catch (error) {
            console.error("Error opening View dialog:", error);
        }
    };

    const handleEdit = (id: string) => {
        try {
            const permission = tableData.find(permission => permission.id === id);
            if (permission) {
                setSelectedPermission(permission);
                setEditDialogOpen(true);
            }
        } catch (error) {
            console.error("Error opening Edit dialog:", error);
        }
    };

    const handleDelete = (id: string) => {
        try {
            const permission = tableData.find(permission => permission.id === id);
            if (permission) {
                setSelectedPermission(permission);
                setDeleteDialogOpen(true);
            }
        } catch (error) {
            console.error("Error opening Delete dialog:", error);
        }
    };

    const confirmDelete = () => {
        try {
            if (!selectedPermission) return;

            router.delete(`/permissions/${selectedPermission.id}`, {
                onSuccess: () => {
                    try {
                        setDeleteDialogOpen(false);
                        setSelectedPermission(null);
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

    if (tableData.length === 0 && !isLoading) {
        return (
            <div className="p-4 border rounded">
                <p>No permissions found or error loading permissions.</p>
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
                        <CardTitle>Permissions</CardTitle>
                        <Button onClick={() => setCreateDialogOpen(true)} className="gap-1">
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Permission</span>
                        </Button>
                    </div>
                    <CardDescription>
                        Manage permissions that can be assigned to roles.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filter Section */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search permissions..."
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
                                {(searchFilter || guardFilter) && (
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
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Guard Name</label>
                                        <Select
                                            value={guardFilter ?? "all"}
                                            onValueChange={(value) => setGuardFilter(value === "all" ? null : value)}
                                        >
                                            <SelectTrigger className="bg-background">
                                                <SelectValue placeholder="Select guard" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Guards</SelectItem>
                                                {availableGuards.map((guard) => (
                                                    <SelectItem key={guard} value={guard}>
                                                        {guard}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Filters */}
                    {(searchFilter || guardFilter) && (
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
                            {guardFilter && (
                                <Badge variant="secondary" className="gap-1 text-foreground bg-muted hover:bg-muted/80">
                                    Guard: {guardFilter}
                                    <X
                                        className="h-3 w-3 cursor-pointer text-foreground/70 hover:text-foreground"
                                        onClick={() => setGuardFilter(null)}
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
                                <p className="mt-2">Loading permissions...</p>
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
                                                No permissions found matching your criteria.
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

            {/* Dialogs */}
            {viewDialogOpen && (
                <ViewPermissionDialog
                    permission={selectedPermission}
                    isOpen={viewDialogOpen}
                    onClose={() => setViewDialogOpen(false)}
                />
            )}

            {editDialogOpen && (
                <EditPermissionDialog
                    permission={selectedPermission}
                    isOpen={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                />
            )}

            {createDialogOpen && (
                <CreatePermissionDialog
                    isOpen={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                />
            )}

            {deleteDialogOpen && (
                <DeletePermissionDialog
                    permission={selectedPermission}
                    isOpen={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
}
