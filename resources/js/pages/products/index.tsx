import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search, SlidersHorizontal, X, Eye, Pencil, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type Product } from '@/types/product';
import { ProductForm } from './product-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'products',
        href: '/products',
    },
];

interface DataTableProps {
    columns: ColumnDef<Product>[];
    data: Product[];
    onEdit: (product: Product) => void;
    onDelete: (productId: number) => void;
}

export function DataTable({ columns, data, onEdit, onDelete }: DataTableProps) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center py-4">
                                No products found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default function Products() {
    const { products, categories, flash } = usePage().props as any;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

    // Search and filter states
    const [searchFilter, setSearchFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [tableData, setTableData] = useState<Product[]>([]);
    const [filteredData, setFilteredData] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Display flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Initialize table data
    useEffect(() => {
        try {
            setIsLoading(true);
            if (products && products.data) {
                setTableData(products.data);
                setFilteredData(products.data);
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Error processing product data:", error);
            setTableData([]);
            setFilteredData([]);
            setIsLoading(false);
        }
    }, [products]);

    // Apply filters when search or filters change
    useEffect(() => {
        let result = [...tableData];

        // Text search filter
        if (searchFilter) {
            const searchLower = searchFilter.toLowerCase();
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchLower) ||
                (product.description && product.description.toLowerCase().includes(searchLower))
            );
        }

        // Category filter
        if (categoryFilter) {
            result = result.filter(product =>
                product.category && product.category.id.toString() === categoryFilter
            );
        }

        // Status filter
        if (statusFilter) {
            result = result.filter(product =>
                product.status === statusFilter
            );
        }

        setFilteredData(result);
    }, [tableData, searchFilter, categoryFilter, statusFilter]);

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => {
                const description = row.getValue('description') as string;
                return description ? description.substring(0, 50) + (description.length > 50 ? '...' : '') : '-';
            }
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: ({ row }) => {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(parseFloat(row.getValue('price') as string));
            }
        },
        {
            accessorKey: 'stock',
            header: 'Stock',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium
                        ${status === 'active' ? 'bg-green-100 text-green-800' :
                          status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'}`}>
                        {status?.toUpperCase()}
                    </span>
                );
            }
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) => {
                const category = row.original.category;
                return category ? category.name : '-';
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
                            title="Edit Product"
                        >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                            title="Delete Product"
                        >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = (productId: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(route('products.destroy', productId));
        }
    };

    // Toggle filters visibility
    const toggleFilters = () => {
        setFiltersExpanded(prev => !prev);
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchFilter("");
        setCategoryFilter(null);
        setStatusFilter(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle>Products</CardTitle>
                            <Button onClick={() => {
                                setSelectedProduct(undefined);
                                setIsFormOpen(true);
                            }} className="gap-1">
                                <Plus className="h-4 w-4" />
                                <span>Add Product</span>
                            </Button>
                        </div>
                        <CardDescription>
                            Manage products inventory
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Filter Section */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center space-x-2">
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
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
                                    {(searchFilter || categoryFilter || statusFilter) && (
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

                            {/* Filter content */}
                            {filtersExpanded && (
                                <div className="space-y-4 bg-muted/50 dark:bg-muted/20 p-4 rounded-md mt-3 animate-in fade-in-50 duration-200 border border-border">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Category</label>
                                            <Select
                                                value={categoryFilter ?? "all"}
                                                onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
                                            >
                                                <SelectTrigger className="bg-background">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    {categories && categories.map((category: any) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
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
                                                    <SelectItem value="discontinued">Discontinued</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Active Filters */}
                        {(searchFilter || categoryFilter || statusFilter) && (
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
                                {categoryFilter && (
                                    <Badge variant="secondary" className="gap-1 text-foreground bg-muted hover:bg-muted/80">
                                        Category: {categories.find((c: any) => c.id.toString() === categoryFilter)?.name}
                                        <X
                                            className="h-3 w-3 cursor-pointer text-foreground/70 hover:text-foreground"
                                            onClick={() => setCategoryFilter(null)}
                                        />
                                    </Badge>
                                )}
                                {statusFilter && (
                                    <Badge variant="secondary" className="gap-1 text-foreground bg-muted hover:bg-muted/80">
                                        Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                                        <X
                                            className="h-3 w-3 cursor-pointer text-foreground/70 hover:text-foreground"
                                            onClick={() => setStatusFilter(null)}
                                        />
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Loading state */}
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                    <p className="mt-2">Loading products...</p>
                                </div>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={filteredData}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                    </CardContent>
                </Card>

                <ProductForm
                    isOpen={isFormOpen}
                    onClose={() => {
                        setIsFormOpen(false);
                        setSelectedProduct(undefined);
                    }}
                    product={selectedProduct}
                />
            </div>
        </AppLayout>
    );
}
