export interface Product {
    id: number;
    name: string;
    description?: string | null;
    price?: number | string;
    stock?: number | string;
    status?: string;
    image?: string | null;
    category?: {
        id: number;
        name: string;
    } | null;
    category_id?: number | string | null;
    user_id?: number | string | null;
    created_at?: string | null;
    updated_at?: string | null;
}
