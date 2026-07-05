import re

with open('resources/js/components/ProductSection.jsx', 'r') as f:
    content = f.read()

# Add the import
import_hook = "import useProductSection from '../hooks/useProductSection';\n"
content = re.sub(r'(import { formatRupiah } from \'../utils/helpers\';\nimport { useLanguage } from \'../context/LanguageContext\';\n)', r'\1' + import_hook, content)

# Replace the body
hook_call = """
    const {
        sortBy, setSortBy,
        minPriceInput, setMinPriceInput,
        maxPriceInput, setMaxPriceInput,
        selectedRating, setSelectedRating,
        isMobileFilterOpen, setIsMobileFilterOpen,
        filteredProducts,
        handleApplyFilters,
        handleResetFilters,
        isFilterActive
    } = useProductSection(products, searchQuery, selectedCategory);
"""
# Find everything from `const [sortBy, setSortBy]` down to `const isFilterActive = ...;`
pattern = r'(const \[sortBy, setSortBy\].*?const isFilterActive = [^;]+;)'

content = re.sub(pattern, hook_call.strip(), content, flags=re.DOTALL)

with open('resources/js/components/ProductSection.jsx', 'w') as f:
    f.write(content)

