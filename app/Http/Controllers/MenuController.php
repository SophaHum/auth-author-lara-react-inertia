<?php

namespace App\Http\Controllers;

use App\Services\MenuService;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    protected $menuService;

    public function __construct(MenuService $menuService)
    {
        $this->menuService = $menuService;
    }

    /**
     * Get menu items for the authenticated user
     */
    public function getMenu()
    {
        $menuItems = $this->menuService->getMenu();

        return response()->json([
            'menu' => $menuItems
        ]);
    }
}
