<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::orderBy('id', 'desc')
                    ->paginate(10)
                    ->through(function($category) {
                        return [
                            'id' => $category->id,
                            'name' => $category->name,
                            'description' => $category->description,
                            'created_at' => $category->created_at ? $category->created_at->format('Y-m-d H:i:s') : null,
                            'updated_at' => $category->updated_at ? $category->updated_at->format('Y-m-d H:i:s') : null,
                        ];
                    });

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:categories,name',
                'description' => 'nullable|string',
            ]);

            Category::create([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
            ]);

            return redirect()->route('categories.index')
                ->with('success', 'Category created successfully');

        } catch (\Exception $e) {
            Log::error('Error creating category: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to create category')
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
            $category = Category::findOrFail($id);

            $categoryData = [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'created_at' => $category->created_at ? $category->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $category->updated_at ? $category->updated_at->format('Y-m-d H:i:s') : null,
            ];

            return response()->json(['category' => $categoryData]);

        } catch (\Exception $e) {
            Log::error('Error showing category: ' . $e->getMessage());
            return response()->json(['error' => 'Category not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:categories,name,'.$id,
                'description' => 'nullable|string',
            ]);

            $category = Category::findOrFail($id);
            $category->update([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
            ]);

            return redirect()->back()->with('success', 'Category updated successfully');

        } catch (\Exception $e) {
            Log::error('Error updating category: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to update category')
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
            $category = Category::findOrFail($id);

            // Check if category has associated products
            if ($category->products()->count() > 0) {
                return response()->json(['error' => 'Cannot delete category with associated products'], 403);
            }

            $category->delete();
            DB::commit();
            return response()->json(['success' => 'Category deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting category: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete category'], 500);
        }
    }
}
