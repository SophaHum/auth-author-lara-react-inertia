<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with('category')
                    ->orderBy('id', 'desc')
                    ->paginate(10)
                    ->through(function($product) {
                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                            'description' => $product->description,
                            'price' => $product->price,
                            'category' => $product->category ? [
                                'id' => $product->category->id,
                                'name' => $product->category->name,
                            ] : null,
                            'created_at' => $product->created_at ? $product->created_at->format('Y-m-d H:i:s') : null,
                            'updated_at' => $product->updated_at ? $product->updated_at->format('Y-m-d H:i:s') : null,
                        ];
                    });

        // Get all categories for product creation/editing
        $categories = Category::all(['id', 'name'])->toArray();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'category_id' => 'nullable|exists:categories,id',
            ]);

            Product::create([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'price' => $request->input('price'),
                'category_id' => $request->input('category_id'),
            ]);

            return redirect()->route('products.index')
                ->with('success', 'Product created successfully');

        } catch (\Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to create product')
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
            $product = Product::with('category')->findOrFail($id);

            $productData = [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
                'created_at' => $product->created_at ? $product->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $product->updated_at ? $product->updated_at->format('Y-m-d H:i:s') : null,
            ];

            return response()->json(['product' => $productData]);

        } catch (\Exception $e) {
            Log::error('Error showing product: ' . $e->getMessage());
            return response()->json(['error' => 'Product not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'category_id' => 'nullable|exists:categories,id',
            ]);

            $product = Product::findOrFail($id);
            $product->update([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'price' => $request->input('price'),
                'category_id' => $request->input('category_id'),
            ]);

            return redirect()->back()->with('success', 'Product updated successfully');

        } catch (\Exception $e) {
            Log::error('Error updating product: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to update product')
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
            $product = Product::findOrFail($id);
            $product->delete();
            DB::commit();
            return response()->json(['success' => 'Product deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting product: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete product'], 500);
        }
    }
}
