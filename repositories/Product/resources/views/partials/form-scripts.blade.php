<script>
    $(document).ready(function() {
        function checkProductType() {
            var selectedOption = $('#product_type_id option:selected');
            var typeName = selectedOption.data('name') || '';

            if (typeName === 'variant') {
                $('#parent_product_group').slideDown();
                $('#parent_id').prop('required', true);
            } else {
                $('#parent_product_group').slideUp();
                $('#parent_id').prop('required', false).val('');
            }

            if (typeName === 'configurable') {
                $('#sku_group').slideDown();
                $('#price_group').slideDown();
                $('#stock_group').slideUp();
                $('#stock').prop('required', false).val('0');
            } else {
                $('#sku_group').slideDown();
                $('#stock_group').slideDown();
                $('#price_group').slideDown();
            }
        }

        $('#product_type_id').on('change', checkProductType);
        checkProductType();

        @if($product->exists && $product->type && $product->type->name === 'configurable')
            var variantDt = null;

            // Varian-only script setup
            function initVariantsTable() {
                // Show section first so DataTable can measure column widths
                $('#variants-section').show();
                if (!variantDt && $('#datatable_variants').length) {
                    variantDt = $('#datatable_variants').DataTable({
                        ajax: {
                            url: "{{ route('product.index') }}",
                            data: function(d) {
                                d.parent_id = "{{ $product->id }}";
                            }
                        },
                        serverSide: true,
                        processing: false,
                        order: [[1, 'asc']],
                        scrollX: false,
                        autoWidth: false,
                        dom: '<"row align-items-center mb-2"<"col-sm-6"l><"col-sm-6 text-right"B>>rt<"row align-items-center mt-2"<"col-sm-5"i><"col-sm-7"p>>',
                        buttons: [],
                        columns: [
                            {
                                data: null,
                                orderable: false,
                                searchable: false,
                                defaultContent: '<input type="checkbox" class="row-checkbox">',
                                className: 'text-center',
                                width: '40px'
                            },
                            { data: 'name', name: 'name' },
                            { data: 'sku', name: 'sku' },
                            { data: 'price', name: 'price' },
                            { data: 'stock', name: 'stock' },
                            { data: 'product_type_id', name: 'product_type_id' },
                            { data: 'action', name: 'action', orderable: false, searchable: false, className: 'text-center' }
                        ],
                        language: {
                            search: '',
                            searchPlaceholder: 'Cari varian...',
                            lengthMenu: '_MENU_ per halaman',
                            info: 'Menampilkan _START_ - _END_ dari _TOTAL_ data',
                            infoEmpty: 'Tidak ada data',
                            infoFiltered: '(disaring dari _MAX_ total)',
                            zeroRecords: '<div style="padding:30px;text-align:center;color:#94a3b8;">Tidak ada varian ditemukan</div>',
                            paginate: { first: '«', previous: '‹', next: '›', last: '»' }
                        },
                        drawCallback: function () {
                            if (typeof feather !== 'undefined') feather.replace();
                        }
                    });
                } else if (variantDt) {
                    variantDt.columns.adjust().draw(false);
                }
            }

            // Delete handler
            $(document).on('click', '.btn-scaffolding-delete', function (e) {
                e.preventDefault();
                var url = $(this).attr('href') || $(this).data('url');
                Swal.fire({
                    title: 'Hapus data ini?',
                    text: 'Data tidak dapat dikembalikan setelah dihapus.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Ya, Hapus!',
                    cancelButtonText: 'Batal'
                }).then(function (result) {
                    if (result.isConfirmed) {
                        $.ajax({
                            url: url,
                            method: 'DELETE',
                            data: { _token: '{{ csrf_token() }}' },
                            success: function () {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success',
                                    text: 'Data berhasil dihapus!',
                                    timer: 1500,
                                    showConfirmButton: false
                                }).then(function() {
                                    if (variantDt) variantDt.ajax.reload(null, false);
                                });
                            },
                            error: function () {
                                Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghapus data.' });
                            }
                        });
                    }
                });
            });
        @endif

        @if($product->exists)
            function lockForm() {
                $('#form-wrapper').addClass('is-locked');
                $('#product-form').find('input, select, textarea, button').prop('disabled', true);
                $('#form-actions').fadeOut(150);
            }

            function unlockForm() {
                $('#form-wrapper').removeClass('is-locked');
                $('#product-form').find('input, select, textarea, button').prop('disabled', false);
                $('#form-actions').fadeIn(150);
                checkProductType();
            }

            // Handle tab switching for all products
            $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
                var target = $(e.target).attr('href');

                if (target === '#variants-pane') {
                    lockForm();
                    if (typeof initVariantsTable === 'function') {
                        initVariantsTable();
                    }
                    $('#category-section').hide();
                    $('#images-section').hide();
                    $('#attributes-section').hide();
                    $('#mutations-section').hide();
                    $('#info-section').hide();
                } else if (target === '#category-pane') {
                    lockForm();
                    $('#variants-section').hide();
                    $('#images-section').hide();
                    $('#attributes-section').hide();
                    $('#mutations-section').hide();
                    $('#info-section').hide();
                    $('#category-section').show();
                    if (!categoryTreeLoaded) {
                        loadCategoryTree();
                    }
                } else if (target === '#images-pane') {
                    lockForm();
                    $('#variants-section').hide();
                    $('#category-section').hide();
                    $('#attributes-section').hide();
                    $('#mutations-section').hide();
                    $('#info-section').hide();
                    $('#images-section').show();
                    loadProductImages();
                } else if (target === '#attribute-pane') {
                    lockForm();
                    $('#variants-section').hide();
                    $('#category-section').hide();
                    $('#images-section').hide();
                    $('#mutations-section').hide();
                    $('#info-section').hide();
                    $('#attributes-section').show();
                    loadProductAttributes();
                } else if (target === '#mutation-pane') {
                    lockForm();
                    $('#variants-section').hide();
                    $('#category-section').hide();
                    $('#images-section').hide();
                    $('#attributes-section').hide();
                    $('#info-section').hide();
                    $('#mutations-section').show();
                    loadProductMutations();
                } else {
                    // Back to Information tab
                    unlockForm();
                    $('#variants-section').hide();
                    $('#category-section').hide();
                    $('#images-section').hide();
                    $('#attributes-section').hide();
                    $('#mutations-section').hide();
                    $('#info-section').show();
                }
            });

            // Toggle Flash Sale options in bottom info tab
            $(document).on('change', '#disc_is_flash_sale', function() {
                if ($(this).is(':checked')) {
                    $('#disc-flash-sale-details').slideDown(200);
                } else {
                    $('#disc-flash-sale-details').slideUp(200);
                }
            });

            // Save Discount settings via AJAX
            $(document).on('click', '#btn-save-discount-settings', function() {
                var btn = $(this);
                var originalText = btn.text();
                btn.prop('disabled', true).text('Saving...');
                $('#discount-save-status').fadeOut(100);

                $.ajax({
                    url: "{{ route('api.product.discount.save', $product->id) }}",
                    type: "POST",
                    data: $('#discount-settings-form').serialize(),
                    success: function(response) {
                        btn.prop('disabled', false).text(originalText);
                        if (response.success) {
                            $('#discount-save-status').fadeIn(150);
                            setTimeout(function() {
                                $('#discount-save-status').fadeOut(500);
                            }, 3000);
                            
                            if (typeof toastr !== 'undefined') {
                                toastr.success(response.message || 'Settings saved successfully');
                            }
                        } else {
                            alert(response.message || 'An error occurred.');
                        }
                    },
                    error: function(xhr) {
                        btn.prop('disabled', false).text(originalText);
                        var errorMsg = 'Failed to save settings.';
                        if (xhr.responseJSON && xhr.responseJSON.message) {
                            errorMsg = xhr.responseJSON.message;
                        }
                        alert(errorMsg);
                    }
                });
            });

            // ============ CATEGORY TREE ============
            var categoryTreeLoaded = false;
            var productId = {{ $product->id }};
            var apiCategoriesUrl = '{{ route('api.categories.list') }}';
            var apiCategoryStoreUrl = '{{ route('api.categories.store') }}';
            var syncUrl = '{{ route('api.product.categories.sync', $product->id) }}';
            var getCategoriesUrl = '{{ route('api.product.categories.get', $product->id) }}';
            var csrfToken = '{{ csrf_token() }}';

            function loadCategoryTree() {
                $.getJSON(apiCategoriesUrl, function(categories) {
                    $.getJSON(getCategoriesUrl, function(selectedIds) {
                        var nodes = categories.map(function(cat) {
                            var isParent = cat.parent === '#';
                            return {
                                id:     cat.id,
                                parent: cat.parent,
                                text:   cat.text,
                                icon:   isParent ? 'feather icon-folder' : 'feather icon-tag',
                                state: { checked: selectedIds.indexOf(parseInt(cat.id)) !== -1 },
                                a_attr: {
                                    style: isParent 
                                        ? 'font-weight: 700; color: #1e1b4b; font-size: 13.5px;' 
                                        : 'font-weight: 500; color: #4b5563; font-size: 12.5px; padding-left: 4px;'
                                }
                            };
                        });

                        $('#category-tree').jstree({
                            core: {
                                data: nodes,
                                check_callback: true,
                                themes: { name: 'default', responsive: true, icons: true }
                            },
                            plugins: ['checkbox'],
                            checkbox: {
                                three_state: false,
                                cascade: '',
                                tie_selection: false,
                                whole_node: false
                            }
                        });

                        // Bind check and uncheck events for auto-saving
                        $('#category-tree').on('check_node.jstree uncheck_node.jstree', function() {
                            saveCategories();
                        });

                        // Bind select and deselect node directly
                        $('#category-tree').on('select_node.jstree deselect_node.jstree', function() {
                            var selected = $('#category-tree').jstree('get_selected', true);
                            if (selected.length > 0) {
                                $('#selected-parent-label').text('Parent: ' + selected[0].text).removeClass('badge-light-secondary').addClass('badge-light-primary');
                                $('#btn-clear-parent').show();
                            } else {
                                $('#selected-parent-label').text('Parent: [Root]').removeClass('badge-light-primary').addClass('badge-light-secondary');
                                $('#btn-clear-parent').hide();
                            }
                        });

                        categoryTreeLoaded = true;
                    });
                });
            }

            // Clear parent selection
            $(document).on('click', '#btn-clear-parent', function(e) {
                e.preventDefault();
                $('#category-tree').jstree('deselect_all');
                $('#selected-parent-label').text('Parent: [Root]').removeClass('badge-light-primary').addClass('badge-light-secondary');
                $('#btn-clear-parent').hide();
            });

            // Auto-save categories function
            function saveCategories() {
                var selectedIds = $('#category-tree').jstree('get_checked');
                $('#autosave-status').text('Saving...').fadeIn(100);
                $.ajax({
                    url: syncUrl,
                    method: 'POST',
                    data: { _token: csrfToken, category_ids: selectedIds },
                    success: function(resp) {
                        $('#autosave-status').text('✓ Autosaved').fadeOut(1500);
                    },
                    error: function() {
                        $('#autosave-status').text('✗ Save failed').fadeOut(2000);
                    }
                });
            }

            // Add category inline
            $(document).on('click', '#btn-add-category', function() {
                var name = $('#new-category-name').val().trim();
                if (!name) { Swal.fire({ icon: 'warning', title: 'Name required', text: 'Please enter a category name.' }); return; }

                // Get selected parent node
                var selectedNodes = $('#category-tree').jstree('get_selected');
                var parentId = selectedNodes.length > 0 ? selectedNodes[0] : null;

                $.ajax({
                    url: apiCategoryStoreUrl,
                    method: 'POST',
                    data: { 
                        _token: csrfToken, 
                        name: name,
                        parent_id: parentId
                    },
                    success: function(resp) {
                        if (resp.success) {
                            var targetParent = resp.category.parent === '#' ? '#' : resp.category.parent;
                            var newNodeId = $('#category-tree').jstree('create_node', targetParent, {
                                id: resp.category.id,
                                text: resp.category.text,
                                icon: false
                            }, 'last', false, false);
                            
                            $('#category-tree').jstree('check_node', newNodeId);
                            $('#new-category-name').val('');
                            Swal.fire({ icon: 'success', title: 'Added!', text: resp.category.text + ' added.', timer: 1200, showConfirmButton: false });
                        }
                    },
                    error: function() {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create category.' });
                    }
                });
            });

            // Allow Enter key on input to trigger add
            $(document).on('keypress', '#new-category-name', function(e) {
                if (e.which === 13) { e.preventDefault(); $('#btn-add-category').trigger('click'); }
            });

            // ============ PRODUCT IMAGES ============
            var apiImagesUrl = '{{ route('api.product.images.list', $product->id) }}';
            var uploadImageUrl = '{{ route('api.product.images.upload', $product->id) }}';
            var reorderImagesUrl = '{{ route('api.product.images.reorder', $product->id) }}';

            function loadProductImages() {
                $('#images-grid').html('<div class="col-12 text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-1">Loading images...</p></div>');
                
                $.getJSON(apiImagesUrl, function(images) {
                    var grid = $('#images-grid');
                    grid.empty();

                    if (images.length === 0) {
                        grid.html('<div class="col-12 text-center py-4 text-muted">😕 No images uploaded yet. Drag and drop files above to upload.</div>');
                        return;
                    }

                    images.forEach(function(img) {
                        var cardHtml = `
                            <div class="col-md-3 col-sm-6 image-card-wrapper" data-id="${img.id}">
                                <div class="image-card ${img.is_primary ? 'is-primary' : ''}">
                                    <div class="image-preview-container">
                                        <img src="${img.url}" alt="Product Image">
                                    </div>
                                    <div class="image-card-footer">
                                        ${img.is_primary 
                                            ? '<span class="badge-primary-marker"><i class="fa fa-check-circle"></i> Primary</span>' 
                                            : `<button type="button" class="btn btn-set-primary btn-sm" data-id="${img.id}">Set Primary</button>`
                                        }
                                        <button type="button" class="btn btn-delete-img btn-sm" data-id="${img.id}">Delete</button>
                                    </div>
                                </div>
                            </div>
                        `;
                        grid.append(cardHtml);
                    });

                    // Initialize SortableJS for reordering
                    var el = document.getElementById('images-grid');
                    Sortable.create(el, {
                        animation: 150,
                        ghostClass: 'sortable-placeholder',
                        onEnd: function() {
                            var orders = [];
                            $('#images-grid .image-card-wrapper').each(function() {
                                orders.push($(this).data('id'));
                            });
                            saveImageOrder(orders);
                        }
                    });
                });
            }

            // Drag over / Drag leave effects
            var dropzone = $('#image-dropzone');
            dropzone.on('dragover dragenter', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropzone.addClass('dragover');
            });
            dropzone.on('dragleave dragend drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropzone.removeClass('dragover');
            });

            // Handle Drop
            dropzone.on('drop', function(e) {
                var files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    uploadFiles(files);
                }
            });

            // Click dropzone to browse
            dropzone.on('click', function() {
                $('#image-file-input').trigger('click');
            });
            $('#image-file-input').on('click', function(e) {
                e.stopPropagation(); // Prevents bubbling up to dropzone click handler
            });
            $('#btn-browse-images').on('click', function(e) {
                e.stopPropagation();
                $('#image-file-input').trigger('click');
            });

            // Browse file change
            $('#image-file-input').on('change', function() {
                var files = this.files;
                if (files.length > 0) {
                    uploadFiles(files);
                }
            });

            // Upload files function
            function uploadFiles(files) {
                var total = files.length;
                var uploaded = 0;

                Swal.fire({
                    title: 'Uploading...',
                    text: 'Please wait while images are uploading.',
                    allowOutsideClick: false,
                    didOpen: function() {
                        Swal.showLoading();
                    }
                });

                Array.from(files).forEach(function(file) {
                    var formData = new FormData();
                    formData.append('file', file);
                    formData.append('_token', csrfToken);

                    $.ajax({
                        url: uploadImageUrl,
                        method: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function() {
                            uploaded++;
                            if (uploaded === total) {
                                Swal.close();
                                loadProductImages();
                                toast('success', 'Uploaded successfully!');
                            }
                        },
                        error: function() {
                            uploaded++;
                            if (uploaded === total) {
                                Swal.close();
                                loadProductImages();
                            }
                            toast('error', 'Failed to upload ' + file.name);
                        }
                    });
                });
            }

            // Save order function
            function saveImageOrder(orders) {
                $.ajax({
                    url: reorderImagesUrl,
                    method: 'POST',
                    data: { _token: csrfToken, orders: orders },
                    success: function() {
                        toast('success', 'Order updated!');
                    },
                    error: function() {
                        toast('error', 'Failed to update order.');
                    }
                });
            }

            // Delete Image
            $(document).on('click', '.btn-delete-img', function() {
                var imageId = $(this).data('id');
                var url = `{{ url('/admin/api/products/' . $product->id . '/images') }}/${imageId}`;

                Swal.fire({
                    title: 'Delete this image?',
                    text: 'This image will be removed permanently.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Yes, Delete it!'
                }).then(function(result) {
                    if (result.isConfirmed) {
                        $.ajax({
                            url: url,
                            method: 'DELETE',
                            data: { _token: csrfToken },
                            success: function() {
                                loadProductImages();
                                toast('success', 'Image deleted.');
                            },
                            error: function() {
                                toast('error', 'Failed to delete image.');
                            }
                        });
                    }
                });
            });

            // Set Primary Image
            $(document).on('click', '.btn-set-primary', function() {
                var imageId = $(this).data('id');
                var url = `{{ url('/admin/api/products/' . $product->id . '/images') }}/${imageId}/primary`;

                $.ajax({
                    url: url,
                    method: 'POST',
                    data: { _token: csrfToken },
                    success: function() {
                        loadProductImages();
                        toast('success', 'Primary image updated!');
                    },
                    error: function() {
                        toast('error', 'Failed to set primary image.');
                    }
                });
            });

            // Helper toast
            function toast(icon, title) {
                var Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                Toast.fire({ icon: icon, title: title });
            }

            // ============ PRODUCT ATTRIBUTES ============
            var apiAttributesUrl = '{{ route('api.product.attributes.list', $product->id) }}';
            var syncAttributesUrl = '{{ route('api.product.attributes.sync', $product->id) }}';
            var storeAttributeUrl = '{{ route('api.attributes.store') }}';
            
            // Keeps track of which attributes are currently displayed in this form session
            var sessionActiveAttributes = [];

            function loadProductAttributes(forceShowId) {
                if (forceShowId && sessionActiveAttributes.indexOf(parseInt(forceShowId)) === -1) {
                    sessionActiveAttributes.push(parseInt(forceShowId));
                }

                $('#attributes-container').html('<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-1">Loading attributes...</p></div>');
                
                $.getJSON(apiAttributesUrl, function(attributes) {
                    // 1. Identify which attributes are already checked on database and mark them active
                    attributes.forEach(function(attr) {
                        var hasSelectedVal = attr.values.some(function(val) { return val.selected; });
                        if (hasSelectedVal && sessionActiveAttributes.indexOf(parseInt(attr.id)) === -1) {
                            sessionActiveAttributes.push(parseInt(attr.id));
                        }
                    });

                    // 2. Populate the choose attribute dropdown select picker
                    var picker = $('#select-attribute-picker');
                    picker.empty().append('<option value="">-- Choose Attribute --</option>');
                    
                    attributes.forEach(function(attr) {
                        // Only show attributes in select list if they are not currently displayed
                        if (sessionActiveAttributes.indexOf(parseInt(attr.id)) === -1) {
                            picker.append(`<option value="${attr.id}">${attr.name}</option>`);
                        }
                    });

                    // 3. Render the active attribute cards
                    var container = $('#attributes-container');
                    container.empty();

                    var activeCardsCount = 0;

                    attributes.forEach(function(attr) {
                        // Skip rendering if this attribute is not active in this session
                        if (sessionActiveAttributes.indexOf(parseInt(attr.id)) === -1) {
                            return;
                        }

                        activeCardsCount++;

                        var valuesHtml = '';
                        attr.values.forEach(function(val) {
                            valuesHtml += `
                                <div class="value-tag ${val.selected ? 'active' : ''}" data-id="${val.id}">
                                    ${val.selected ? '<i class="fa fa-check mr-1" style="font-size: 10px;"></i>' : ''} ${val.value}
                                </div>
                            `;
                        });

                        var cardHtml = `
                            <div class="attribute-card mb-3" data-id="${attr.id}">
                                <div class="d-flex justify-content-between align-items-center flex-wrap" style="gap: 10px;">
                                    <h6 class="font-weight-bold text-dark mb-0">${attr.name}</h6>
                                    
                                    {{-- Add value mini-form inline --}}
                                    <div class="input-group input-group-sm" style="max-width: 200px;">
                                        <input type="text" class="form-control input-add-val-inline" placeholder="Add value (e.g. XL)..." id="input-val-${attr.id}" style="border-radius: 6px 0 0 6px !important;">
                                        <div class="input-group-append">
                                            <button type="button" class="btn btn-primary btn-add-val-inline" data-attribute-id="${attr.id}" style="border-radius: 0 6px 6px 0 !important; font-weight: 700;">+</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="value-tag-container mt-2">
                                    ${valuesHtml || '<small class="text-muted">No values yet. Add one on the right.</small>'}
                                </div>
                            </div>
                        `;
                        container.append(cardHtml);
                    });

                    if (activeCardsCount === 0) {
                        container.html('<div class="text-center py-4 text-muted">😕 No attributes added to this product. Choose one from the dropdown or create a new one to start.</div>');
                    }
                });
            }

            // Click tag to toggle selection and auto-save
            $(document).on('click', '.value-tag', function() {
                var tag = $(this);
                tag.toggleClass('active');
                
                // Get clean text (ignoring icon text)
                var cleanVal = tag.text().trim();
                
                if (tag.hasClass('active')) {
                    tag.html(`<i class="fa fa-check mr-1" style="font-size: 10px;"></i> ${cleanVal}`);
                } else {
                    tag.text(cleanVal);
                }
                
                saveProductAttributes();
            });

            // Add selected attribute to view
            $(document).on('click', '#btn-add-selected-attribute', function() {
                var selectedId = $('#select-attribute-picker').val();
                if (!selectedId) {
                    Swal.fire({ icon: 'warning', title: 'Choose attribute', text: 'Please choose an attribute from the dropdown first.' });
                    return;
                }
                loadProductAttributes(selectedId);
            });

            // Save attributes function
            function saveProductAttributes() {
                var selectedValueIds = [];
                $('.value-tag.active').each(function() {
                    selectedValueIds.push($(this).attr('data-id'));
                });

                $('#attribute-autosave-status').text('Saving...').fadeIn(100);
                $.ajax({
                    url: syncAttributesUrl,
                    method: 'POST',
                    data: { _token: csrfToken, attribute_value_ids: selectedValueIds },
                    success: function(resp) {
                        $('#attribute-autosave-status').text('✓ Autosaved').fadeOut(1500);
                    },
                    error: function() {
                        $('#attribute-autosave-status').text('✗ Save failed').fadeOut(2000);
                    }
                });
            }

            // Add Attribute Globally and automatically show it
            $(document).on('click', '#btn-add-attribute', function() {
                var name = $('#new-attribute-name').val().trim();
                if (!name) { Swal.fire({ icon: 'warning', title: 'Name required', text: 'Please enter attribute name.' }); return; }

                $.ajax({
                    url: storeAttributeUrl,
                    method: 'POST',
                    data: { _token: csrfToken, name: name },
                    success: function(resp) {
                        if (resp.success) {
                            $('#new-attribute-name').val('');
                            // Auto display the newly created attribute
                            loadProductAttributes(resp.attribute.id);
                            Swal.fire({ icon: 'success', title: 'Added!', text: `Attribute "${resp.attribute.name}" created.`, timer: 1200, showConfirmButton: false });
                        }
                    },
                    error: function() {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create attribute.' });
                    }
                });
            });

            // Add value to specific Attribute inline
            $(document).on('click', '.btn-add-val-inline', function() {
                var attributeId = $(this).attr('data-attribute-id');
                var input = $(`#input-val-${attributeId}`);
                var val = input.val().trim();
                if (!val) { Swal.fire({ icon: 'warning', title: 'Value required', text: 'Please enter value name.' }); return; }

                var url = `{{ url('/admin/api/attributes') }}/${attributeId}/values`;

                $.ajax({
                    url: url,
                    method: 'POST',
                    data: { _token: csrfToken, value: val },
                    success: function(resp) {
                        if (resp.success) {
                            input.val('');
                            loadProductAttributes();
                            toast('success', `Added "${resp.value.value}"`);
                        }
                    },
                    error: function() {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to add attribute value.' });
                    }
                });
            });

            // Allow Enter key on inline inputs to trigger adding
            $(document).on('keypress', '#new-attribute-name', function(e) {
                if (e.which === 13) { e.preventDefault(); $('#btn-add-attribute').trigger('click'); }
            });
            $(document).on('keypress', '.input-add-val-inline', function(e) {
                if (e.which === 13) { 
                    e.preventDefault(); 
                    $(this).siblings('.btn-add-val-inline').trigger('click'); 
                }
            });
            // ============ PRODUCT STOCK MUTATIONS ============
            var apiMutationsUrl = '{{ route('api.product.mutations.list', $product->id) }}';
            var adjustStockUrl = '{{ route('api.product.mutations.adjust', $product->id) }}';

            function loadProductMutations() {
                $('#mutations-history-tbody').html('<tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-primary spinner-border-sm" role="status"></div> Loading mutations...</td></tr>');
                
                $.getJSON(apiMutationsUrl, function(mutations) {
                    var tbody = $('#mutations-history-tbody');
                    tbody.empty();

                    $('#mutation-history-count').text(mutations.length + ' Records');

                    if (mutations.length === 0) {
                        tbody.html('<tr><td colspan="5" class="text-center text-muted py-4">😕 No stock mutations recorded for this product yet.</td></tr>');
                        return;
                    }

                    mutations.forEach(function(mut) {
                        // Format date
                        var dateStr = '-';
                        if (mut.created_at) {
                            var d = new Date(mut.created_at);
                            // Format: YYYY-MM-DD HH:MM
                            var year = d.getFullYear();
                            var month = String(d.getMonth() + 1).padStart(2, '0');
                            var day = String(d.getDate()).padStart(2, '0');
                            var hours = String(d.getHours()).padStart(2, '0');
                            var minutes = String(d.getMinutes()).padStart(2, '0');
                            dateStr = `${year}-${month}-${day} ${hours}:${minutes}`;
                        }

                        // Badges
                        var typeBadge = mut.type === 'in' 
                            ? '<span class="badge badge-light-success font-weight-bold" style="padding: 4px 8px;">IN</span>'
                            : '<span class="badge badge-light-danger font-weight-bold" style="padding: 4px 8px;">OUT</span>';

                        var qtyText = mut.type === 'in'
                            ? `<span class="text-success font-weight-bold">+${mut.quantity}</span>`
                            : `<span class="text-danger font-weight-bold">-${mut.quantity}</span>`;

                        var refText = mut.reference_type 
                            ? `<span class="badge badge-light-info text-capitalize">${mut.reference_type}</span>`
                            : '<span class="text-muted small">-</span>';

                        var rowHtml = `
                            <tr>
                                <td>${dateStr}</td>
                                <td>${typeBadge}</td>
                                <td style="text-align: right; font-weight: 700;">${qtyText}</td>
                                <td>${refText}</td>
                                <td class="text-muted">${mut.notes ? escapeHtml(mut.notes) : '-'}</td>
                            </tr>
                        `;
                        tbody.append(rowHtml);
                    });
                });
            }

            // Simple HTML escape helper
            function escapeHtml(text) {
                return text
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }

            // Submit stock adjustment
            $('#stock-adjustment-form').on('submit', function(e) {
                e.preventDefault();
                
                var btn = $('#btn-submit-adjustment');
                var type = $('#mutation-type').val();
                var qty = parseInt($('#mutation-qty').val());
                var notes = $('#mutation-notes').val().trim();

                if (!qty || qty < 1) {
                    Swal.fire({ icon: 'warning', title: 'Invalid Quantity', text: 'Please enter a quantity greater than 0.' });
                    return;
                }

                btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Applying...');

                $.ajax({
                    url: adjustStockUrl,
                    method: 'POST',
                    data: {
                        _token: csrfToken,
                        type: type,
                        quantity: qty,
                        notes: notes
                    },
                    success: function(resp) {
                        btn.prop('disabled', false).text('Apply Adjustment');
                        if (resp.success) {
                            // Reset notes and qty input
                            $('#mutation-notes').val('');
                            $('#mutation-qty').val(1);
                            
                            // Reload mutations list
                            loadProductMutations();

                            // Dynamically update the main product form stock input field if it exists!
                            if ($('#stock').length) {
                                $('#stock').val(resp.new_stock);
                            }

                            Swal.fire({
                                icon: 'success',
                                title: 'Adjusted!',
                                text: resp.message,
                                timer: 1500,
                                showConfirmButton: false
                            });
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: resp.message });
                        }
                    },
                    error: function(xhr) {
                        btn.prop('disabled', false).text('Apply Adjustment');
                        var errorMsg = 'Failed to apply stock adjustment.';
                        if (xhr.responseJSON && xhr.responseJSON.message) {
                            errorMsg = xhr.responseJSON.message;
                        }
                        Swal.fire({ icon: 'error', title: 'Adjustment Failed', text: errorMsg });
                    }
                });
            });
            @endif
        });
    </script>
