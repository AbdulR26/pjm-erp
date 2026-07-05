@extends('layouts.app')
@section('title', $title)
@section('content')
    <div class="card card-custom">
        <div class="card-header border-bottom-0 pb-0 d-flex align-items-center justify-content-between">
            <h4 class="card-title font-weight-bold text-primary mb-0">{{ $title }}</h4>
        </div>

        <div class="card-body pt-2">
            {{-- FORM always visible (locked when on other tabs) --}}
            <div id="form-wrapper">
                <form action="{{ $product->exists ? route('product.edit', $product->id) : route('product.create') }}" method="POST" class="form-gd-custom" id="product-form">
                    @csrf
                    @if($product->exists)
                        @method('PATCH')
                    @else
                        @method('PUT')
                    @endif

                    <div class="row" id="form-fields">
                        {{-- Form Inputs (Name, SKU, Type, Parent, Status, Price, Stock, Description, Actions) --}}
                        @include('product-module::partials.form-fields')
                    </div>
                </form>
            </div>

            {{-- Tab switching sections for Variants, Categories, and Images --}}
            @if($product->exists)
                {{-- Tab Navigation (at BOTTOM, below form) --}}
                <div class="mt-3">
                    <ul class="nav nav-tabs card-impl-tabs" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" id="info-tab" data-toggle="tab" href="#info-pane" aria-controls="info-pane" role="tab" aria-selected="true">
                                Product Information
                            </a>
                        </li>
                        @if($product->type && $product->type->name === 'configurable')
                            <li class="nav-item">
                                <a class="nav-link" id="variants-tab" data-toggle="tab" href="#variants-pane" aria-controls="variants-pane" role="tab" aria-selected="false">
                                    Product Variants ({{ $product->variants->count() }})
                                </a>
                            </li>
                        @endif
                        <li class="nav-item">
                            <a class="nav-link" id="category-tab" data-toggle="tab" href="#category-pane" aria-controls="category-pane" role="tab" aria-selected="false">
                                Category
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="images-tab" data-toggle="tab" href="#images-pane" aria-controls="images-pane" role="tab" aria-selected="false">
                                Product Images
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="attribute-tab" data-toggle="tab" href="#attribute-pane" aria-controls="attribute-pane" role="tab" aria-selected="false">
                                Attributes
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="mutation-tab" data-toggle="tab" href="#mutation-pane" aria-controls="mutation-pane" role="tab" aria-selected="false">
                                Stock Mutations
                            </a>
                        </li>
                    </ul>
                </div>

                {{-- Variants List Tab Content --}}
                @if($product->type && $product->type->name === 'configurable')
                    @include('product-module::partials.tab-variants')
                @endif

                {{-- Category tree Tab Content --}}
                @include('product-module::partials.tab-categories')

                {{-- Product Images Tab Content --}}
                @include('product-module::partials.tab-images')

                {{-- Product Attributes Tab Content --}}
                @include('product-module::partials.tab-attributes')

                {{-- Product Stock Mutations Tab Content --}}
                @include('product-module::partials.tab-mutations')

                {{-- Product Information tab pane content (Discount & Flash Sale) --}}
                @include('product-module::partials.tab-info')
            @endif
        </div>
    </div>
@endsection

@push('css')
    <style>
        .card-custom {
            border-radius: 12px !important;
            border: none !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
            padding: 10px !important;
        }
        .form-group {
            margin-bottom: 12px !important;
        }
        .form-control, .input-group-text {
            border-radius: 6px !important;
            border: 1px solid #d8d6de !important;
            padding: 8px 12px !important;
            height: auto !important;
            font-size: 13px !important;
        }
        .input-group-prepend .input-group-text {
            border-top-right-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            background-color: #f8f8f8;
            color: #5e5873;
        }
        .input-group .form-control {
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
        }
        .form-control:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 3px 8px rgba(59, 130, 246, 0.1) !important;
        }
        .card-impl-tabs {
            border-bottom: 2px solid #ebe9f1 !important;
        }
        .card-impl-tabs .nav-link {
            border: none !important;
            color: #6e6b7b;
            font-weight: 600;
            padding: 10px 16px;
            font-size: 13px;
            border-bottom: 3px solid transparent !important;
            transition: all 0.15s ease;
            margin-bottom: -2px;
        }
        .card-impl-tabs .nav-link.active {
            color: #3b82f6 !important;
            background-color: transparent !important;
            border-bottom: 3px solid #3b82f6 !important;
        }

        /* Form locked state styling */
        #form-wrapper.is-locked {
            position: relative;
        }
        #form-wrapper.is-locked::after {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(248, 248, 250, 0.6);
            border-radius: 8px;
            z-index: 10;
            pointer-events: all;
            cursor: not-allowed;
        }
        #form-wrapper.is-locked .form-control,
        #form-wrapper.is-locked select,
        #form-wrapper.is-locked textarea {
            background-color: #f5f5f7 !important;
            color: #9e9b9b !important;
            pointer-events: none;
        }
        #form-wrapper.is-locked label {
            color: #b0adb7 !important;
        }

        /* Scaffolding Table UI */
        #datatable_variants th {
            background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
            color: #ffffff !important;
            border: none !important;
            border-bottom: 3px solid #3b82f6 !important;
            text-align: center !important;
            font-weight: 600 !important;
            padding: 10px !important;
            font-size: 12px;
            letter-spacing: 0.5px;
        }
        #datatable_variants tbody tr:nth-child(even) { background-color: #fafafb; }
        #datatable_variants tbody tr:hover { background-color: #f3f2f7 !important; transition: background .1s; }
        #datatable_variants td .btn {
            border-radius: 6px !important;
            padding: 4px 8px !important;
            font-weight: 600 !important;
            font-size: 10px !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            transition: all 0.15s ease;
            margin: 2px !important;
        }
        #datatable_variants td .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 3px 8px rgba(0,0,0,0.1);
        }
        /* jsTree custom styling */
        #category-tree .jstree-anchor {
            font-size: 13px !important;
            padding: 4px 6px !important;
        }
        #category-tree .jstree-node {
            margin: 3px 0;
        }
        #category-tree.jstree-default .jstree-clicked {
            background: #eff6ff !important;
            border-radius: 4px !important;
            box-shadow: none !important;
        }
        #category-tree.jstree-default .jstree-hovered {
            background: #f3f4f6 !important;
            border-radius: 4px !important;
            box-shadow: none !important;
        }
        #category-section .form-control {
            border-radius: 6px !important;
            height: 36px !important;
        }
    </style>
    <link rel="stylesheet" href="{{ asset('template/app-assets/vendors/css/extensions/jstree.min.css') }}">
    <link rel="stylesheet" href="{{ asset('template/app-assets/css/plugins/extensions/ext-component-tree.min.css') }}">
@endpush

@push('script')
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    <script src="{{ asset('template/app-assets/vendors/js/extensions/jstree.min.js') }}"></script>
    {{-- Form and Tree switching JS scripts --}}
    @include('product-module::partials.form-scripts')
@endpush
