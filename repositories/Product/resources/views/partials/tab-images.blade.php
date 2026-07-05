<div id="images-section" style="display:none;">
    <hr class="mt-2 mb-3">
    
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="font-weight-bold text-primary mb-0">Product Images</h5>
        <small class="text-muted">Drag images to reorder. The first image will be set as primary automatically, or you can check "Set Primary" manually.</small>
    </div>

    {{-- Drag & Drop Upload Zone --}}
    <input type="file" id="image-file-input" multiple accept="image/*" class="d-none">
    <div id="image-dropzone" class="image-dropzone mb-4 d-flex flex-column align-items-center justify-content-center">
        <i data-feather="upload-cloud" style="width: 48px; height: 48px; color: #3b82f6;" class="mb-2"></i>
        <h5 class="font-weight-bold text-dark mb-1">Drag & Drop Product Images Here</h5>
        <p class="text-muted small mb-2">or click to browse from your device</p>
        <button type="button" class="btn btn-outline-primary btn-sm" id="btn-browse-images">Browse Files</button>
    </div>

    {{-- Images Grid Area --}}
    <div id="images-grid" class="row images-grid sortable-images-container">
        {{-- Filled via JavaScript --}}
    </div>
</div>

@push('css')
<style>
    /* Premium Drag & Drop Area */
    .image-dropzone {
        border: 2px dashed #3b82f6;
        background: #f8fafc;
        border-radius: 12px;
        padding: 40px 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .image-dropzone:hover, .image-dropzone.dragover {
        background: #eff6ff;
        border-color: #2563eb;
        transform: scale(1.005);
    }

    /* Images Grid Cards */
    .image-card-wrapper {
        margin-bottom: 20px;
        cursor: grab;
        transition: transform 0.2s ease;
    }
    .image-card-wrapper:active {
        cursor: grabbing;
    }
    .image-card {
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        background: #fff;
        position: relative;
        transition: all 0.2s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .image-card:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        border-color: #3b82f6;
    }
    
    /* Primary Image Highlight */
    .image-card.is-primary {
        border: 2px solid #22c55e !important;
        box-shadow: 0 8px 25px rgba(34, 197, 94, 0.15);
    }
    
    /* Image Preview Container */
    .image-preview-container {
        position: relative;
        padding-top: 75%; /* 4:3 Aspect Ratio */
        background: #f1f5f9;
        overflow: hidden;
    }
    .image-preview-container img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* Image Card Actions overlay/footer */
    .image-card-footer {
        padding: 10px;
        background: #fff;
        border-top: 1px solid #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
    }
    
    /* Delete & Primary buttons */
    .btn-delete-img {
        padding: 4px 8px !important;
        border-radius: 6px !important;
        color: #ef4444;
        font-size: 11px !important;
        font-weight: 600;
        border: 1px solid #fee2e2;
        background: #fef2f2;
        transition: all 0.15s ease;
    }
    .btn-delete-img:hover {
        background: #ef4444;
        color: #fff;
        border-color: #ef4444;
    }
    .badge-primary-marker {
        background: #22c55e;
        color: white;
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 20px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 2px 6px rgba(34, 197, 94, 0.2);
    }
    .btn-set-primary {
        padding: 4px 8px !important;
        border-radius: 6px !important;
        color: #4f46e5;
        font-size: 11px !important;
        font-weight: 600;
        border: 1px solid #e0e7ff;
        background: #f5f3ff;
        transition: all 0.15s ease;
    }
    .btn-set-primary:hover {
        background: #4f46e5;
        color: #fff;
        border-color: #4f46e5;
    }

    /* Sortable drag placeholder */
    .sortable-placeholder {
        border: 2px dashed #cbd5e1;
        background: #f8fafc;
        border-radius: 12px;
        margin-bottom: 20px;
        min-height: 160px;
    }
</style>
@endpush
