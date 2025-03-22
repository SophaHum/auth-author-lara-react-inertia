<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
