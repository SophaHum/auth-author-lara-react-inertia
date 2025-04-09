<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RoleController extends Controller
{
    public function __construct()
    {
        // $this->middleware('permission:role-list|role-create|role-edit|role-delete', ['only' => ['index','store']]);
        // $this->middleware('permission:role-create', ['only' => ['create','store']]);
        // $this->middleware('permission:role-edit', ['only' => ['edit','update']]);
        // $this->middleware('permission:role-delete', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Properly format roles data with permissions
        $roles = Role::with('permissions')
                   ->orderBy('id', 'desc')
                   ->paginate(10)
                   ->through(function($role) {
                       return [
                           'id' => $role->id,
                           'name' => $role->name,
                           'guard_name' => $role->guard_name,
                           'permissions' => $role->permissions->map(function($permission) {
                               return [
                                   'id' => $permission->id,
                                   'name' => $permission->name,
                               ];
                           })->toArray(),
                           'created_at' => $role->created_at ? $role->created_at->format('Y-m-d H:i:s') : null,
                           'updated_at' => $role->updated_at ? $role->updated_at->format('Y-m-d H:i:s') : null,
                       ];
                   });

        // Get all permissions for role creation/editing
        $permissions = Permission::all(['id', 'name'])->toArray();

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissions' => $permissions
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|unique:roles,name',
                'permissions' => 'nullable|array',
            ]);

            $role = Role::create([
                'name' => $request->input('name'),
                'guard_name' => 'web'
            ]);

            if ($request->has('permissions')) {
                $role->syncPermissions($request->input('permissions'));
            }

            return redirect()->route('roles.index')
                ->with('success', 'Role created successfully');

        } catch (\Exception $e) {
            Log::error('Error creating role: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to create role')
                ->withErrors(['name' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $role = Role::with('permissions')->findOrFail($id);

            $roleData = [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'permissions' => $role->permissions->map(function($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                    ];
                })->toArray(),
                'created_at' => $role->created_at ? $role->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $role->updated_at ? $role->updated_at->format('Y-m-d H:i:s') : null,
            ];

            return response()->json(['role' => $roleData]);

        } catch (\Exception $e) {
            Log::error('Error showing role: ' . $e->getMessage());
            return response()->json(['error' => 'Role not found'], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $request->validate([
                'name' => 'required|unique:roles,name,'.$id,
                'permissions' => 'nullable|array',
            ]);

            $role = Role::findOrFail($id);
            $role->name = $request->input('name');
            $role->save();

            if ($request->has('permissions')) {
                $role->syncPermissions($request->input('permissions'));
            } else {
                $role->syncPermissions([]);
            }

            return redirect()->back()->with('success', 'Role updated successfully');

        } catch (\Exception $e) {
            Log::error('Error updating role: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to update role')
                ->withErrors(['name' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();

            $role = Role::findOrFail($id);

            // Check if this is the Admin role (assuming ID 1 or name 'Admin')
            if ($role->id === 1 || $role->name === 'Admin') {
                return response()->json(['error' => 'Cannot delete Admin role'], 403);
            }

            $role->delete();

            DB::commit();
            return response()->json(['success' => 'Role deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting role: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete role'], 500);
        }
    }
}
