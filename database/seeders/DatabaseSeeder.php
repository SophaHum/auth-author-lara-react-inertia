<?php

namespace Database\Seeders;

use App\Models\User;
use Spatie\Permission\Models\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call the permission and role seeders
        $this->call([
            PermissionTableSeeder::class,
            CreateAdminUserSeeder::class,
            UserRoleSeeder::class,  // New seeder for creating users with roles
        ]);

        // Create test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ])->assignRole('User'); // Assign basic user role
    }
}
