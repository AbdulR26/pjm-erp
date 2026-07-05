<div id="category-section" style="display:none;">
    <hr class="mt-2 mb-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="font-weight-bold text-primary mb-0">Product Categories</h5>
        <small class="text-success font-weight-bold" id="autosave-status" style="display:none;">✓ Autosaved</small>
    </div>

    {{-- Add new category inline --}}
    <div class="d-flex align-items-center mb-3" style="gap:8px; flex-wrap: wrap;">
        <input type="text" id="new-category-name" class="form-control" style="max-width:280px;" placeholder="New category name...">
        <button type="button" class="btn btn-success btn-sm" id="btn-add-category">
            + Add Category
        </button>
        <span class="badge badge-light-secondary" id="selected-parent-label" style="padding: 8px 12px; font-weight: 600;">Parent: [Root]</span>
        <button type="button" class="btn btn-link btn-sm text-secondary" id="btn-clear-parent" style="display:none; padding: 0;">(Clear)</button>
    </div>

    {{-- jsTree container --}}
    <div id="category-tree" style="min-height:120px; border:1px solid #ebe9f1; border-radius:8px; padding:12px; background:#fafafa;"></div>
</div>
