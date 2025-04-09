import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    Home, User, Shield, Key, Package, List, ChevronDown,
    ChevronRight, Menu as MenuIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MenuItem {
    name: string;
    route: string;
    icon: string;
    permission: string | null;
}

interface MenuProps {
    className?: string;
    collapsed?: boolean;
}

const getIcon = (iconName: string) => {
    switch (iconName) {
        case 'home': return <Home className="h-5 w-5" />;
        case 'user': return <User className="h-5 w-5" />;
        case 'shield': return <Shield className="h-5 w-5" />;
        case 'key': return <Key className="h-5 w-5" />;
        case 'package': return <Package className="h-5 w-5" />;
        case 'list': return <List className="h-5 w-5" />;
        default: return <MenuIcon className="h-5 w-5" />;
    }
};

export function AppMenu({ className, collapsed = false }: MenuProps) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/menu');

                if (!response.ok) {
                    throw new Error('Failed to fetch menu items');
                }

                const data = await response.json();
                setMenuItems(data.menu || []);
                setError(null);
            } catch (err) {
                console.error('Error loading menu:', err);
                setError('Unable to load navigation menu');
                setMenuItems([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMenu();
    }, []);

    if (isLoading) {
        return (
            <div className={cn("flex flex-col space-y-2 p-4", className)}>
                <div className="animate-pulse h-8 bg-muted rounded"></div>
                <div className="animate-pulse h-8 bg-muted rounded"></div>
                <div className="animate-pulse h-8 bg-muted rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn("flex flex-col p-4 text-red-500", className)}>
                <p>{error}</p>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <nav className={cn("space-y-1", className)}>
            {menuItems.map((item) => (
                <Link
                    key={item.route}
                    href={`/${item.route}`}
                    className={cn(
                        "flex items-center py-2 px-3 text-sm font-medium rounded-md",
                        "hover:bg-muted transition-colors",
                        "text-foreground"
                    )}
                >
                    <span className="mr-3">{getIcon(item.icon)}</span>
                    {!collapsed && <span>{item.name}</span>}
                </Link>
            ))}
        </nav>
    );
}
