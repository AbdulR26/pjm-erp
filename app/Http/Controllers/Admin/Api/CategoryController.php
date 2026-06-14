<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * List semua kategori (flat list dengan info parent).
     */
    public function index(Request $request)
    {
        $query = Category::with(['parent', 'children'])
            ->withCount('products');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->boolean('root_only')) {
            $query->whereNull('parent_id');
        }

        $categories = $query->orderBy('parent_id')->orderBy('name')->get();

        return response()->json([
            'status'     => 'success',
            'categories' => $categories->map(fn($c) => $this->formatCategory($c)),
        ]);
    }

    /**
     * Nested tree — untuk dropdown & tampilan tree di frontend.
     */
    public function tree()
    {
        $roots = Category::whereNull('parent_id')
            ->with(['children.children.children']) // support 3 level deep
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'tree'   => $roots->map(fn($c) => $this->buildTreeNode($c)),
        ]);
    }

    /**
     * Create kategori baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'slug'      => 'nullable|string|max:255|unique:categories,slug',
        ]);

        // Prevent circular reference: parent can't be itself
        $slug = $validated['slug'] ?? Str::slug($validated['name']);

        // Make slug unique if collision
        $slug = $this->makeUniqueSlug($slug);

        // Prevent category from being a child of its own descendant
        if (!empty($validated['parent_id'])) {
            $parent = Category::findOrFail($validated['parent_id']);
            if ($this->isDescendantOf($parent, null)) {
                return response()->json(['message' => 'Kategori parent tidak valid.'], 422);
            }
        }

        $category = Category::create([
            'name'      => $validated['name'],
            'slug'      => $slug,
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return response()->json([
            'status'   => 'success',
            'message'  => 'Kategori berhasil dibuat.',
            'category' => $this->formatCategory($category->load(['parent', 'children'])),
        ], 201);
    }

    /**
     * Show single category.
     */
    public function show(string $id)
    {
        $category = Category::with(['parent', 'children.children'])
            ->withCount('products')
            ->findOrFail($id);

        return response()->json([
            'status'   => 'success',
            'category' => $this->formatCategory($category),
        ]);
    }

    /**
     * Update kategori.
     */
    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'parent_id' => [
                'nullable',
                'exists:categories,id',
                // Can't set parent to itself
                Rule::notIn([$id]),
            ],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('categories', 'slug')->ignore($id),
            ],
        ]);

        // Prevent circular: category can't be a descendant of itself
        if (!empty($validated['parent_id']) && $this->isDescendantOf($category, (int) $validated['parent_id'])) {
            return response()->json(['message' => 'Tidak dapat menjadikan turunan sebagai parent.'], 422);
        }

        $slug = $validated['slug'] ?? Str::slug($validated['name']);
        if ($slug !== $category->slug) {
            $slug = $this->makeUniqueSlug($slug, $id);
        }

        $category->update([
            'name'      => $validated['name'],
            'slug'      => $slug,
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return response()->json([
            'status'   => 'success',
            'message'  => 'Kategori berhasil diperbarui.',
            'category' => $this->formatCategory($category->fresh(['parent', 'children'])),
        ]);
    }

    /**
     * Delete kategori. Gagal jika ada produk terkait.
     */
    public function destroy(string $id)
    {
        $category = Category::withCount(['products', 'children'])->findOrFail($id);

        if ($category->products_count > 0) {
            return response()->json([
                'message' => "Kategori tidak dapat dihapus karena masih memiliki {$category->products_count} produk.",
            ], 422);
        }

        if ($category->children_count > 0) {
            return response()->json([
                'message' => "Kategori tidak dapat dihapus karena masih memiliki {$category->children_count} sub-kategori.",
            ], 422);
        }

        $category->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    private function formatCategory(Category $cat): array
    {
        return [
            'id'             => $cat->id,
            'name'           => $cat->name,
            'slug'           => $cat->slug,
            'parent_id'      => $cat->parent_id,
            'parent_name'    => $cat->parent?->name,
            'children_count' => $cat->children->count(),
            'products_count' => $cat->products_count ?? 0,
            'children'       => $cat->children->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug])->toArray(),
            'created_at'     => $cat->created_at?->format('Y-m-d H:i'),
        ];
    }

    private function buildTreeNode(Category $cat): array
    {
        return [
            'id'             => $cat->id,
            'name'           => $cat->name,
            'slug'           => $cat->slug,
            'parent_id'      => $cat->parent_id,
            'products_count' => $cat->products_count ?? 0,
            'children'       => $cat->children->map(fn($c) => $this->buildTreeNode($c))->toArray(),
        ];
    }

    private function makeUniqueSlug(string $slug, int $excludeId = null): string
    {
        $original = $slug;
        $count    = 1;
        while (true) {
            $query = Category::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
            if (!$query->exists()) {
                break;
            }
            $slug = $original . '-' . $count;
            $count++;
        }
        return $slug;
    }

    /**
     * Check if $category has $targetId as a descendant (to prevent circular parenting).
     */
    private function isDescendantOf(Category $category, ?int $targetId): bool
    {
        if ($targetId === null) return false;
        foreach ($category->children as $child) {
            if ($child->id === $targetId) return true;
            if ($this->isDescendantOf($child, $targetId)) return true;
        }
        return false;
    }
}
