import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { type Product } from '@/types/product';
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

interface Category {
    id: number;
    name: string;
}

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product;
}

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    stock: string;
    status: string;
    image: string;
    category_id: string;
    user_id: string;
    [key: string]: string;
}

export function ProductForm({ isOpen, onClose, product }: ProductFormProps) {
    const { categories, auth } = usePage().props as any;

    const { data, setData, post, put, processing, errors, reset } = useForm<ProductFormData>({
        name: '',
        description: '',
        price: '',
        stock: '0',
        status: 'active',
        image: '',
        category_id: 'none',
        user_id: auth?.user?.id?.toString() || '',
    });

    // Update form data when product changes
    useEffect(() => {
        if (product) {
            setData({
                name: product.name || '',
                description: product.description || '',
                price: product.price ? product.price.toString() : '',
                stock: product.stock ? product.stock.toString() : '0',
                status: product.status || 'active',
                image: product.image || '',
                category_id: product.category?.id ? product.category.id.toString() : 'none',
                user_id: product.user_id?.toString() || auth?.user?.id?.toString() || '',
            });
        } else {
            reset();
            setData({
                name: '',
                description: '',
                price: '',
                stock: '0',
                status: 'active',
                image: '',
                category_id: 'none',
                user_id: auth?.user?.id?.toString() || '',
            });
        }
    }, [product, setData, auth]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure description is never null (use empty string instead)
        if (!data.description) {
            setData('description', '');
        }

        // Process category_id before submission
        if (data.category_id === 'none') {
            setData('category_id', null as any);
        }

        if (product?.id) {
            put(route('products.update', product.id), {
                onSuccess: () => {
                    onClose();
                    // Success message will be shown through the flash message from backend
                }
            });
        } else {
            post(route('products.store'), {
                onSuccess: () => {
                    onClose();
                    // Success message will be shown through the flash message from backend
                }
            });
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {product ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Form fields */}
                    <div className="grid gap-4 py-4">
                        {/* Name field */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.name && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Description field */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.description && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.description}</p>}
                        </div>

                        {/* Price field */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.price && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.price}</p>}
                        </div>

                        {/* Stock field */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={data.stock}
                                onChange={(e) => setData('stock', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.stock && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.stock}</p>}
                        </div>

                        {/* Status field */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(value) => setData('status', value)}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.status}</p>}
                        </div>

                        {/* Image URL field */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="image" className="text-right">Image URL</Label>
                            <Input
                                id="image"
                                value={data.image}
                                onChange={(e) => setData('image', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.image && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.image}</p>}
                        </div>

                        {/* Category field */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Select
                                value={data.category_id}
                                onValueChange={(value) => setData('category_id', value)}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {categories?.map((category: Category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.category_id}</p>}
                        </div>
                    </div>

                    {/* Form buttons */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {product ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
