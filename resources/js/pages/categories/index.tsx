import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search, SlidersHorizontal, X, Pencil, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type Category } from '@/types/category';
import { CategoryForm } from './category-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'categories',
        href: '/categories',
    },
];

interface DataTableProps {
    columns: ColumnDef<Category>[];
    data: Category[];
    onEdit: (category: Category) => void;
    onDelete: (categoryId: number) => void;
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
                                No categories found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default function Categories() {
    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'description',
            header: 'Description',
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
                            onClick={() => handleEdit(category)}
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

    const { categories } = usePage().props as unknown as { categories: { data: Category[] } };
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

    // Search and filter states
    const [searchFilter, setSearchFilter] = useState("");
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [tableData, setTableData] = useState<Category[]>([]);
    const [filteredData, setFilteredData] = useState<Category[]>([]);

    // Initialize table data
    useEffect(() => {
        if (categories && categories.data) {
            setTableData(categories.data);
            setFilteredData(categories.data);
        }
    }, [categories]);

    // Apply filters when search changes
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

        setFilteredData(result);
    }, [tableData, searchFilter]);

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsFormOpen(true);
    };

    const handleDelete = (categoryId: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(route('categories.destroy', categoryId));
        }
    };

    // Toggle filters visibility
    const toggleFilters = () => {
        setFiltersExpanded(prev => !prev);
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchFilter("");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle>Categories</CardTitle>
                            <Button onClick={() => {
                                setSelectedCategory(undefined);
                                setIsFormOpen(true);
                            }} className="gap-1">
                                <Plus className="h-4 w-4" />
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
                                    {searchFilter && (
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

                            {/* Filter content - can be expanded later */}
                            {filtersExpanded && (
                                <div className="space-y-4 bg-muted/50 dark:bg-muted/20 p-4 rounded-md mt-3 animate-in fade-in-50 duration-200 border border-border">
                                    <div className="text-sm text-muted-foreground">
                                        Additional filters can be added here as needed.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Active Filters */}
                        {searchFilter && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="secondary" className="gap-1 text-foreground bg-muted hover:bg-muted/80">
                                    Search: {searchFilter}
                                    <X
                                        className="h-3 w-3 cursor-pointer text-foreground/70 hover:text-foreground"
                                        onClick={() => setSearchFilter("")}
                                    />
                                </Badge>
                            </div>
                        )}

                        <DataTable
                            columns={columns}
                            data={filteredData}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </CardContent>
                </Card>

                <CategoryForm
                    isOpen={isFormOpen}
                    onClose={() => {
                        setIsFormOpen(false);
                        setSelectedCategory(undefined);
                    }}
                    category={selectedCategory}
                />
            </div>
        </AppLayout>
    );
}
