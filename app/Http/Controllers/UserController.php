<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        // $this->middleware('permission:user-list|user-create|user-edit|user-delete', ['only' => ['index','store']]);
        // $this->middleware('permission:user-create', ['only' => ['create','store']]);
        // $this->middleware('permission:user-edit', ['only' => ['edit','update']]);
        // $this->middleware('permission:user-delete', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of users with their roles.
     */
    public function index()
    {
        $users = User::with('roles')
                    ->orderBy('id', 'desc')
                    ->paginate(10)
                    ->through(function($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'roles' => $user->roles->map(function($role) {
                                return [
                                    'id' => $role->id,
                                    'name' => $role->name,
                                ];
                            })->toArray(),
                            'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
                        ];
                    });

        // Get all roles for user creation/editing
        $roles = Role::all(['id', 'name'])->toArray();

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:8',
                'roles' => 'nullable|array',
            ]);

            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            if ($request->has('roles') && !empty($request->roles)) {
                $user->syncRoles($request->roles);
            }

            DB::commit();

            return redirect()->route('users.index')
                ->with('success', 'User created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating user: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to create user')
                ->withErrors(['email' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified user.
     */
    public function show(string $id)
    {
        try {
            $user = User::with(['roles', 'roles.permissions'])->findOrFail($id);

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->map(function($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'permissions' => $role->permissions->map(function($permission) {
                            return [
                                'id' => $permission->id,
                                'name' => $permission->name,
                            ];
                        })->toArray(),
                    ];
                })->toArray(),
                'permissions' => $user->getAllPermissions()->map(function($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                    ];
                })->toArray(),
                'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
            ];

            return response()->json(['user' => $userData]);

        } catch (\Exception $e) {
            Log::error('Error showing user: ' . $e->getMessage());
            return response()->json(['error' => 'User not found'], 404);
        }
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, string $id)
    {
        try {
            $user = User::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,'.$id,
                'password' => 'nullable|min:8',
                'roles' => 'nullable|array',
            ]);

            DB::beginTransaction();

            $user->name = $request->name;
            $user->email = $request->email;

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            if ($request->has('roles') && !empty($request->roles)) {
                $user->syncRoles($request->roles);
            } else {
                $user->syncRoles([]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'User updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating user: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to update user')
                ->withErrors(['email' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified user.
     */
    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            // Prevent deletion of admin user (assuming admin has ID 1)
            if ($user->id === 1) {
                return response()->json(['error' => 'Cannot delete admin user'], 403);
            }

            // Remove role associations first
            $user->syncRoles([]);
            $user->delete();

            DB::commit();
            return response()->json(['success' => 'User deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting user: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete user'], 500);
        }
    }
}
