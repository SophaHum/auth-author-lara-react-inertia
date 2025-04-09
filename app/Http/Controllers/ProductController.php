<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

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
                            'stock' => $product->stock,
                            'status' => $product->status,
                            'image' => $product->image,
                            'category' => $product->category ? [
                                'id' => $product->category->id,
                                'name' => $product->category->name,
                            ] : null,
                            'user_id' => $product->user_id,
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
                'stock' => 'nullable|integer|min:0',
                'status' => 'nullable|string|in:active,inactive,out_of_stock',
                'image' => 'nullable|string',
                'category_id' => 'nullable|exists:categories,id',
                'user_id' => 'nullable|exists:users,id',
            ]);

            $userId = $request->input('user_id') ?? Auth::id();

            Product::create([
                'name' => $request->input('name'),
                'description' => $request->input('description') ?? '', // Ensure description is never null
                'price' => $request->input('price'),
                'stock' => $request->input('stock', 0),
                'status' => $request->input('status', 'active'),
                'image' => $request->input('image') ?? '', // Ensure image is never null if required
                'category_id' => $request->input('category_id'),
                'user_id' => $userId,
            ]);

            return redirect()->route('products.index')
                ->with('success', 'Product created successfully');

        } catch (\Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to create product: ' . $e->getMessage())
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
                'stock' => $product->stock,
                'status' => $product->status,
                'image' => $product->image,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
                'user_id' => $product->user_id,
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
                'stock' => 'nullable|integer|min:0',
                'status' => 'nullable|string|in:active,inactive,out_of_stock',
                'image' => 'nullable|string',
                'category_id' => 'nullable|exists:categories,id',
                'user_id' => 'nullable|exists:users,id',
            ]);

            $userId = $request->input('user_id') ?? Auth::id();

            $product = Product::findOrFail($id);
            $product->update([
                'name' => $request->input('name'),
                'description' => $request->input('description') ?? '', // Ensure description is never null
                'price' => $request->input('price'),
                'stock' => $request->input('stock', 0),
                'status' => $request->input('status', 'active'),
                'image' => $request->input('image') ?? '', // Ensure image is never null if required
                'category_id' => $request->input('category_id'),
                'user_id' => $userId,
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

            return redirect()->back()->with('success', 'Product deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting product: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete product');
        }
    }
}
