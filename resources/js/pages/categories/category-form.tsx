import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { type Category } from '@/types/category';
import { useEffect } from 'react';

interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category;
}

export function CategoryForm({ isOpen, onClose, category }: CategoryFormProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    // Update form data when category changes
    useEffect(() => {
        if (category) {
            setData({
                name: category.name || '',
                description: category.description || '',
            });
        } else {
            reset('name', 'description');
        }
    }, [category, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (category?.id) {
            put(route('categories.update', category.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                reset();
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {category ? 'Edit Category' : 'Add New Category'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.name && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.description && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {category ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
