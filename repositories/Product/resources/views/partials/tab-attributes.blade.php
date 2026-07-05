<div id="attributes-section" style="display:none;">
    <hr class="mt-2 mb-3">
    
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="font-weight-bold text-primary mb-0">Product Attributes</h5>
        <small class="text-success font-weight-bold" id="attribute-autosave-status" style="display:none;">✓ Autosaved</small>
    </div>

    {{-- Attribute Picker & Creator Inline --}}
    <div class="d-flex align-items-end mb-4" style="gap:12px; flex-wrap: wrap;">
        <div style="min-width: 250px;">
            <label class="form-label font-weight-bold text-muted small mb-1" style="display: block;">Choose Existing Attribute</label>
            <select id="select-attribute-picker" class="form-control" style="height: 38px !important; border-radius: 6px;">
                <option value="">-- Choose Attribute --</option>
                {{-- Loaded dynamically --}}
            </select>
        </div>
        <div>
            <button type="button" class="btn btn-primary btn-sm" id="btn-add-selected-attribute" style="height: 38px; border-radius: 6px; padding: 0 20px;">
                Attribute
            </button>
        </div>
        <div class="mx-2 d-none d-md-block" style="border-left: 1px solid #ebe9f1; height: 38px; align-self: flex-end;"></div>
        <div>
            <label class="form-label font-weight-bold text-muted small mb-1" style="display: block;">Or Create New Attribute</label>
            <div class="d-flex" style="gap: 6px;">
                <input type="text" id="new-attribute-name" class="form-control" style="max-width:240px; height: 38px !important; border-radius: 6px;" placeholder="Attribute name (e.g. Bahan)...">
                <button type="button" class="btn btn-success btn-sm" id="btn-add-attribute" style="height: 38px; border-radius: 6px;">
                    +
                </button>
            </div>
        </div>
    </div>

    {{-- Attributes List Container --}}
    <div id="attributes-container" class="d-flex flex-column" style="gap: 20px;">
        {{-- Filled via JavaScript --}}
    </div>
</div>

@push('css')
<style>
    /* Attribute Panel Card styling */
    .attribute-card {
        border: 1px solid #ebe9f1;
        border-radius: 8px;
        background: #fafafa;
        padding: 16px;
        transition: all 0.2s ease;
    }
    .attribute-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.05);
    }
    
    /* Value checkable tags styling */
    .value-tag-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
    }
    .value-tag {
        display: inline-flex;
        align-items: center;
        padding: 6px 14px;
        border-radius: 20px;
        background: #fff;
        border: 1.5px solid #d8d6de;
        color: #5e5873;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        user-select: none;
        transition: all 0.15s ease;
    }
    .value-tag:hover {
        border-color: #3b82f6;
        color: #3b82f6;
        background: #eff6ff;
    }
    .value-tag.active {
        border-color: #3b82f6;
        color: #fff;
        background: #3b82f6;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
    }
    
    /* Add new value mini-form */
    .btn-add-val-inline {
        padding: 4px 10px !important;
        font-size: 11px !important;
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
    }
    .input-add-val-inline {
        max-width: 140px;
        height: 28px !important;
        padding: 2px 8px !important;
        font-size: 11px !important;
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        border-right: none !important;
    }
</style>
@endpush
