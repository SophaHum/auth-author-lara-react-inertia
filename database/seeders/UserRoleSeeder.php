<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create basic roles if they don't exist
        $managerRole = Role::firstOrCreate(['name' => 'Manager']);
        $editorRole = Role::firstOrCreate(['name' => 'Editor']);
        $userRole = Role::firstOrCreate(['name' => 'User']);

        // Assign permissions to roles
        $managerRole->givePermissionTo([
            'user-list', 'user-create', 'user-edit',
            'product-list', 'product-create', 'product-edit',
            'category-list', 'category-create', 'category-edit'
        ]);

        $editorRole->givePermissionTo([
            'product-list', 'product-create', 'product-edit',
            'category-list', 'category-edit'
        ]);

        $userRole->givePermissionTo([
            'product-list', 'category-list'
        ]);

        // Create sample users for each role
        $manager = User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => bcrypt('password')
        ]);
        $manager->assignRole($managerRole);

        $editor = User::create([
            'name' => 'Editor User',
            'email' => 'editor@example.com',
            'password' => bcrypt('password')
        ]);
        $editor->assignRole($editorRole);

        // Users can be created through factory
        User::factory(3)->create()->each(function ($user) use ($userRole) {
            $user->assignRole($userRole);
        });
    }
}
