<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PermissionController extends Controller
{
    public function __construct()
    {
        // $this->middleware('permission:permission-list|permission-create|permission-edit|permission-delete', ['only' => ['index','store']]);
        // $this->middleware('permission:permission-create', ['only' => ['create','store']]);
        // $this->middleware('permission:permission-edit', ['only' => ['edit','update']]);
        // $this->middleware('permission:permission-delete', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $permissions = Permission::select(['id', 'name', 'guard_name', 'created_at', 'updated_at'])
                                 ->orderBy('id', 'desc')
                                 ->limit(100) // Limit to prevent large data loads
                                 ->get()
                                 ->map(function($permission) {
                                     // Ensure serializable data without circular references
                                     return [
                                         'id' => $permission->id,
                                         'name' => $permission->name,
                                         'guard_name' => $permission->guard_name,
                                         'created_at' => $permission->created_at->format('Y-m-d H:i:s'),
                                         'updated_at' => $permission->updated_at->format('Y-m-d H:i:s'),
                                     ];
                                 })
                                 ->toArray();

        return Inertia::render('permissions/index', [
            'permissions' => $permissions,
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
                'name' => 'required|unique:permissions,name',
                'guard_name' => 'nullable|string|max:255',
            ]);

            Permission::create([
                'name' => $request->input('name'),
                'guard_name' => $request->input('guard_name', 'web')
            ]);

            return redirect()->route('permissions.index')
                ->with('success', 'Permission created successfully');

        } catch (\Exception $e) {
            Log::error('Error creating permission: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to create permission')
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
            $permission = Permission::findOrFail($id);

            $permissionData = [
                'id' => $permission->id,
                'name' => $permission->name,
                'guard_name' => $permission->guard_name,
                'created_at' => $permission->created_at ? $permission->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $permission->updated_at ? $permission->updated_at->format('Y-m-d H:i:s') : null,
            ];

            return response()->json(['permission' => $permissionData]);

        } catch (\Exception $e) {
            Log::error('Error showing permission: ' . $e->getMessage());
            return response()->json(['error' => 'Permission not found'], 404);
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
                'name' => 'required|unique:permissions,name,'.$id,
                'guard_name' => 'nullable|string|max:255',
            ]);

            $permission = Permission::findOrFail($id);
            $permission->name = $request->input('name');

            if ($request->has('guard_name')) {
                $permission->guard_name = $request->input('guard_name');
            }

            $permission->save();

            return redirect()->back()->with('success', 'Permission updated successfully');

        } catch (\Exception $e) {
            Log::error('Error updating permission: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to update permission')
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

            $permission = Permission::findOrFail($id);

            // Optional: Check if permission is being used by any roles before deletion
            if ($permission->roles()->count() > 0) {
                return response()->json([
                    'error' => 'This permission is in use by one or more roles and cannot be deleted'
                ], 422);
            }

            $permission->delete();

            DB::commit();
            return response()->json(['success' => 'Permission deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting permission: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete permission'], 500);
        }
    }
}
