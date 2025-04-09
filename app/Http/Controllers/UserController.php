<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            // Get users with extra error handling and simplify data structure
            $users = User::with('roles')
                          ->orderBy('id', 'desc')
                          ->limit(100) // Limit to prevent large data loads
                          ->get()
                          ->map(function($user) {
                              // Ensure serializable data without circular references
                              return [
                                  'id' => $user->id,
                                  'name' => $user->name,
                                  'email' => $user->email,
                                  'role' => $user->getRoleNames()->first(), // Get the first role name
                                  'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                                  'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                              ];
                          })
                          ->toArray();

            // Get all roles for the dropdown
            $roles = Role::select('id', 'name')->orderBy('name')->get();

            return Inertia::render('users/index', [
                'users' => $users,
                'roles' => $roles,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching users: ' . $e->getMessage());

            // Return with empty users array and clear error message
            return Inertia::render('users/index', [
                'users' => [],
                'roles' => [],
                'error' => 'Failed to load users. Please try again.'
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('users/create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'nullable|string|exists:roles,name',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign role if provided
        if (!empty($validated['role'])) {
            $user->assignRole($validated['role']);
        }

        return redirect()->route('users.index')->with('success', 'User created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $user = User::findOrFail($id);
            return Inertia::render('users/show', [
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return redirect()->route('users.index')->with('error', 'User not found');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $user = User::with('roles')->findOrFail($id);
            $roles = Role::select('id', 'name')->orderBy('name')->get();

            return Inertia::render('users/edit', [
                'user' => array_merge($user->toArray(), [
                    'role' => $user->getRoleNames()->first(),
                ]),
                'roles' => $roles,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('users.index')->with('error', 'User not found');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'role' => 'nullable|string|exists:roles,name',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        // Only update password if it's provided
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        // Sync roles if provided
        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        return redirect()->back()->with('success', 'User updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return redirect()->route('users.index')->with('success', 'User deleted successfully');
        } catch (\Exception $e) {
            return redirect()->route('users.index')->with('error', 'Failed to delete user');
        }
    }
}
