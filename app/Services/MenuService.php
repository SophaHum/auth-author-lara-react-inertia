<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;

class MenuService
{
    /**
     * Get menu items based on user permissions
     */
    public function getMenu()
    {
        $user = Auth::user();

        // Define all possible menu items with required permissions
        $allMenuItems = [
            [
                'name' => 'Dashboard',
                'route' => 'dashboard',
                'icon' => 'home',
                'permission' => null, // No permission needed
            ],
            [
                'name' => 'Users',
                'route' => 'users.index',
                'icon' => 'user',
                'permission' => 'user-list',
            ],
            [
                'name' => 'Roles',
                'route' => 'roles.index',
                'icon' => 'shield',
                'permission' => 'role-list',
            ],
            [
                'name' => 'Permissions',
                'route' => 'permissions.index',
                'icon' => 'key',
                'permission' => 'role-list', // Usually same permission as roles
            ],
            [
                'name' => 'Products',
                'route' => 'products.index',
                'icon' => 'package',
                'permission' => 'product-list',
            ],
            [
                'name' => 'Categories',
                'route' => 'categories.index',
                'icon' => 'list',
                'permission' => 'category-list',
            ],
        ];

        // Filter menu items based on permissions
        $menuItems = collect($allMenuItems)->filter(function ($item) use ($user) {
            // If no permission required or user has the permission
            return $item['permission'] === null || $user->can($item['permission']);
        })->values()->toArray();

        return $menuItems;
    }
}
