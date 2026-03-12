// Multi-category filter functionality - ADD THIS NEW VARIABLE
let activeFilters = new Set(['all']); // Track multiple active filters

// Search functionality - KEEP AS IS (no changes needed)
function initializeSearch() {
    const searchInput = document.getElementById('productSearch');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput) {
        // Search on input
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterProducts(searchTerm);
        });
        
        // Search on button click
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                const searchTerm = searchInput.value.toLowerCase();
                filterProducts(searchTerm);
            });
        }
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.toLowerCase();
                filterProducts(searchTerm);
            }
        });
    }
}

// Filter products based on search term - REPLACE THIS FUNCTION
function filterProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.dataset.name.toLowerCase();
        const productCategories = card.dataset.category.toLowerCase().split(',').map(cat => cat.trim());
        const productDescription = card.querySelector('.product-description').textContent.toLowerCase();
        
        const matchesSearch = productName.includes(searchTerm) || 
                            productCategories.some(cat => cat.includes(searchTerm)) ||
                            productDescription.includes(searchTerm);
        
        const matchesCategory = activeFilters.has('all') || 
                               productCategories.some(cat => activeFilters.has(cat));
        
        if (matchesSearch && matchesCategory) {
            showProduct(card);
        } else {
            hideProduct(card);
        }
    });
    
    // Show no results message if no products match
    showNoResultsMessage();
}

// Category filter functionality - REPLACE THIS FUNCTION
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedCategory = this.dataset.category;
            
            // Handle "All Products" button
            if (selectedCategory === 'all') {
                // Clear all filters and activate "All"
                activeFilters.clear();
                activeFilters.add('all');
                
                // Update button states
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            } else {
                // Remove "All" if it's active
                if (activeFilters.has('all')) {
                    activeFilters.delete('all');
                    document.querySelector('.filter-btn[data-category="all"]').classList.remove('active');
                }
                
                // Toggle the selected category
                if (activeFilters.has(selectedCategory)) {
                    activeFilters.delete(selectedCategory);
                    this.classList.remove('active');
                } else {
                    activeFilters.add(selectedCategory);
                    this.classList.add('active');
                }
                
                // If no categories are selected, activate "All"
                if (activeFilters.size === 0) {
                    activeFilters.add('all');
                    document.querySelector('.filter-btn[data-category="all"]').classList.add('active');
                }
            }
            
            // Apply filters
            filterByCategories();
        });
    });
}

// Filter products by category - REPLACE THIS FUNCTION
function filterByCategories() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productCategories = card.dataset.category.toLowerCase().split(',').map(cat => cat.trim());
        
        // Check if product matches any active filter
        const matchesCategory = activeFilters.has('all') || 
                               productCategories.some(cat => activeFilters.has(cat));
        
        if (matchesCategory) {
            showProduct(card);
        } else {
            hideProduct(card);
        }
    });
    
    // Clear search input when filtering by category
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Show no results message if needed
    showNoResultsMessage();
}

// ADD THESE NEW HELPER FUNCTIONS
// Show product with animation
function showProduct(card) {
    card.style.display = 'block';
    card.classList.remove('hidden');
    
    // Add fade-in animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);
}

// Hide product
function hideProduct(card) {
    card.style.display = 'none';
    card.classList.add('hidden');
}

// Show no results message - REPLACE THIS FUNCTION
function showNoResultsMessage() {
    const productsGrid = document.getElementById('productsGrid');
    const visibleProducts = productsGrid.querySelectorAll('.product-card:not(.hidden)');
    
    // Remove existing no results message
    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Add no results message if no products are visible
    if (visibleProducts.length === 0) {
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message';
        noResultsMessage.style.cssText = `
            text-align: center;
            padding: 3rem;
            color: #666;
            font-size: 1.2rem;
            grid-column: 1 / -1;
        `;
        noResultsMessage.innerHTML = `
            <h3>No products found</h3>
            <p>Try adjusting your search terms or browse all categories.</p>
            <button class="clear-filters-btn" onclick="clearAllFilters()" style="
                background-color: #17174f;
                color: white;
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 1rem;
            ">Clear All Filters</button>
        `;
        productsGrid.appendChild(noResultsMessage);
    }
}

// ADD THESE NEW FUNCTIONS
// Clear all filters function
function clearAllFilters() {
    activeFilters.clear();
    activeFilters.add('all');
    
    // Reset all filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn[data-category="all"]').classList.add('active');
    
    // Clear search input
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Show all products
    filterByCategories();
}

// Get active filters display
function getActiveFiltersDisplay() {
    if (activeFilters.has('all')) {
        return 'All Products';
    }
    
    const filterArray = Array.from(activeFilters);
    if (filterArray.length === 1) {
        return filterArray[0].charAt(0).toUpperCase() + filterArray[0].slice(1);
    }
    
    return filterArray.map(filter => 
        filter.charAt(0).toUpperCase() + filter.slice(1)
    ).join(', ');
}

// ADD THIS INITIALIZATION CODE (if you don't already have it)
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    initializeFilters();
});