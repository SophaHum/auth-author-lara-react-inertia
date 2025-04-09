<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MenuController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);
    Route::resource('products', ProductController::class);
    Route::resource('categories', CategoryController::class);

    // Direct form submission for Category creation
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');

    // Menu endpoints
    Route::get('/menu', [MenuController::class, 'getMenu'])->middleware(['auth']);
    Route::get('/user-menu-data', [UserController::class, 'getUserMenu'])->middleware(['auth']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
