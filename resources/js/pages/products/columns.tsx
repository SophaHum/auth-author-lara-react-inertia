import { type ColumnDef, type TableMeta } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

interface ProductTableMeta extends TableMeta<Product> {
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
}
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Product } from "@/types/product";

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            return `$${row.getValue("price")}`;
        },
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const product = row.original;
            const meta = table.options.meta as ProductTableMeta;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => meta.onEdit(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => meta.onDelete(product.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
