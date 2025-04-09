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
    PlusCircle,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    SlidersHorizontal,
    X,
    FolderIcon,
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
    Category,
    ViewCategoryDialog,
    EditCategoryDialog,
    CreateCategoryDialog,
    DeleteCategoryDialog
} from '@/components/categories/category-dialogs';

type PageProps = {
    categories: Category[];
    errors: Errors & ErrorBag;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    },
];

export default function Categories() {
    const pageData = usePage().props as PageProps;

    // Add debugging to see what data is coming from the backend
    console.log('Categories page data:', pageData);

    const categories = Array.isArray(pageData.categories) ? pageData.categories : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="w-full">
                <CategoriesTable categories={categories} />
            </div>
        </AppLayout>
    );
}

function CategoriesTable({ categories }: { categories: Category[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [searchFilter, setSearchFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // Dialog states
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Table data state
    const [tableData, setTableData] = useState<Category[]>([]);
    const [filteredData, setFilteredData] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Process initial data
    useEffect(() => {
        try {
            setIsLoading(true);
            const processedData = (categories || []).map(category => ({
                id: String(category?.id || ''),
                name: String(category?.name || ''),
                description: String(category?.description || ''),
                status: String(category?.status || 'active'),
                product_count: Number(category?.product_count || 0),
                created_at: String(category?.created_at || ''),
                updated_at: String(category?.updated_at || '')
            }));
            setTableData(processedData);
            setFilteredData(processedData);
            setIsLoading(false);
        } catch (error) {
            console.error("Error processing category data:", error);
            setTableData([]);
            setFilteredData([]);
            setIsLoading(false);
        }
    }, [categories]);

    // Apply filters
    useEffect(() => {
        let result = [...tableData];

        // Text search filter
        if (searchFilter) {
            const searchLower = searchFilter.toLowerCase();
            result = result.filter(category =>
                category.name.toLowerCase().includes(searchLower) ||
                (category.description && category.description.toLowerCase().includes(searchLower))
            );
        }

        // Status filter
        if (statusFilter) {
            result = result.filter(category => category.status === statusFilter);
        }

        setFilteredData(result);
    }, [tableData, searchFilter, statusFilter]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [filteredData]);

    const columns: ColumnDef<Category>[] = [
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
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => {
                const description = row.getValue('description') as string;
                return <div className="truncate max-w-[200px]">{description || 'No description'}</div>;
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return (
                    <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'product_count',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Products
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const count = row.getValue('product_count') as number;
                return <div className="text-center">{count}</div>;
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
                const category = row.original;

                return (
                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(category.id)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            title="View Category"
                        >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category.id)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
                            title="Edit Category"
                        >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                            title="Delete Category"
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
        setStatusFilter(null);
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
            const category = tableData.find(category => category.id === id);
            if (category) {
                setSelectedCategory(category);
                setViewDialogOpen(true);
            }
        } catch (error) {
            console.error("Error opening View dialog:", error);
        }
    };

    const handleEdit = (id: string) => {
        try {
            const category = tableData.find(category => category.id === id);
            if (category) {
                setSelectedCategory(category);
                setEditDialogOpen(true);
            }
        } catch (error) {
            console.error("Error opening Edit dialog:", error);
        }
    };

    const handleDelete = (id: string) => {
        try {
            const category = tableData.find(category => category.id === id);
            if (category) {
                setSelectedCategory(category);
                setDeleteDialogOpen(true);
            }
        } catch (error) {
            console.error("Error opening Delete dialog:", error);
        }
    };

    const confirmDelete = () => {
        try {
            if (!selectedCategory) return;

            router.delete(`/categories/${selectedCategory.id}`, {
                onSuccess: () => {
                    try {
                        setDeleteDialogOpen(false);
                        setSelectedCategory(null);
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
            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Manage product categories</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <FolderIcon className="h-16 w-16 text-gray-400" />
                        <div className="text-lg font-medium">No categories found</div>
                        <div className="text-sm text-gray-500">
                            Create your first category to organize your products
                        </div>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Category
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Categories</CardTitle>
                        <Button onClick={() => setCreateDialogOpen(true)} className="gap-1">
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Category</span>
                        </Button>
                    </div>
                    <CardDescription>
                        Manage product categories
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filter Section */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search categories..."
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
                                {(searchFilter || statusFilter) && (
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
                                        <label className="text-sm font-medium text-foreground">Status</label>
                                        <Select
                                            value={statusFilter ?? "all"}
                                            onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
                                        >
                                            <SelectTrigger className="bg-background">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Filters */}
                    {(searchFilter || statusFilter) && (
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
                            {statusFilter && (
                                <Badge variant="secondary" className="gap-1 text-foreground bg-muted hover:bg-muted/80">
                                    Status: {statusFilter}
                                    <X
                                        className="h-3 w-3 cursor-pointer text-foreground/70 hover:text-foreground"
                                        onClick={() => setStatusFilter(null)}
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
                                <p className="mt-2">Loading categories...</p>
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
                                                No categories found matching your criteria.
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
                <ViewCategoryDialog
                    category={selectedCategory}
                    isOpen={viewDialogOpen}
                    onClose={() => setViewDialogOpen(false)}
                />
            )}

            {editDialogOpen && (
                <EditCategoryDialog
                    category={selectedCategory}
                    isOpen={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                />
            )}

            {createDialogOpen && (
                <CreateCategoryDialog
                    isOpen={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                />
            )}

            {deleteDialogOpen && (
                <DeleteCategoryDialog
                    category={selectedCategory}
                    isOpen={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
}
