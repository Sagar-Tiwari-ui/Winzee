// product-category.js - Product Category Page functionality for Winzee website
// Author: Winzee Development Team
// Version: 1.0.0

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ======================
    // Configuration
    // ======================
    const CURRENCY_CONFIG = {
        symbol: '₹',
        code: 'INR',
        position: 'before',
        decimal: 2,
        thousand: ',',
        freeShippingThreshold: 500
    };
    
    // API endpoints (simulated)
    const API_ENDPOINTS = {
        products: '/api/products',
        categories: '/api/categories',
        reviews: '/api/reviews',
        filters: '/api/filters'
    };
    
    // ======================
    // State Management
    // ======================
    let state = {
        products: [],
        filteredProducts: [],
        currentPage: 1,
        productsPerPage: 12,
        currentView: 'grid',
        currentSort: 'featured',
        activeFilters: {
            priceRange: { min: 0, max: 1000 },
            productType: [],
            features: [],
            scent: [],
            rating: 0
        },
        isLoading: false,
        categoryId: null
    };
    
    // ======================
    // DOM Elements
    // ======================
    const elements = {
        productsGrid: document.getElementById('productsGrid'),
        loadMoreBtn: document.getElementById('loadMoreProducts'),
        sortSelect: document.getElementById('sortProducts'),
        viewBtns: document.querySelectorAll('.view-btn'),
        minPriceSlider: document.getElementById('minPrice'),
        maxPriceSlider: document.getElementById('maxPrice'),
        minPriceValue: document.getElementById('minPriceValue'),
        maxPriceValue: document.getElementById('maxPriceValue'),
        filterCheckboxes: document.querySelectorAll('.filter-checkbox input'),
        clearFiltersBtn: document.getElementById('clearFilters'),
        resultsCount: document.querySelector('.results-count strong'),
        quickViewModal: document.getElementById('quickViewModal'),
        reviewModal: document.getElementById('reviewModal'),
        writeReviewBtn: document.getElementById('writeReviewBtn'),
        reviewForm: document.getElementById('reviewForm'),
        starRatingInputs: document.querySelectorAll('.star-rating-input i')
    };
    
    // ======================
    // Initialize
    // ======================
    function init() {
        // Get category from URL or data attribute
        state.categoryId = getCategoryId();
        
        // Load initial products
        loadProducts();
        
        // Initialize event listeners
        initEventListeners();
        
        // Initialize filters
        initFilters();
        
        // Initialize tooltips
        initTooltips();
        
        // Update cart count
        updateCartCount();
    }
    
    // ======================
    // Event Listeners
    // ======================
    function initEventListeners() {
        // Sort dropdown
        if (elements.sortSelect) {
            elements.sortSelect.addEventListener('change', handleSortChange);
        }
        
        // View toggle buttons
        elements.viewBtns.forEach(btn => {
            btn.addEventListener('click', handleViewChange);
        });
        
        // Price range sliders
        if (elements.minPriceSlider && elements.maxPriceSlider) {
            elements.minPriceSlider.addEventListener('input', handlePriceRangeChange);
            elements.maxPriceSlider.addEventListener('input', handlePriceRangeChange);
        }
        
        // Filter checkboxes
        elements.filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleFilterChange);
        });
        
        // Clear filters button
        if (elements.clearFiltersBtn) {
            elements.clearFiltersBtn.addEventListener('click', handleClearFilters);
        }
        
        // Load more button
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.addEventListener('click', handleLoadMore);
        }
        
        // Write review button
        if (elements.writeReviewBtn) {
            elements.writeReviewBtn.addEventListener('click', openReviewModal);
        }
        
        // Review form
        if (elements.reviewForm) {
            elements.reviewForm.addEventListener('submit', handleReviewSubmit);
        }
        
        // Star rating inputs
        initStarRating();
        
        // Product card interactions
        document.addEventListener('click', handleProductCardClick);
        
        // Window resize for responsive adjustments
        window.addEventListener('resize', debounce(handleResize, 250));
    }
    
    // ======================
    // Product Loading
    // ======================
    async function loadProducts() {
        if (state.isLoading) return;
        
        state.isLoading = true;
        showLoadingState();
        
        try {
            // Simulate API call
            const products = await fetchProducts();
            
            if (state.currentPage === 1) {
                state.products = products;
            } else {
                state.products = [...state.products, ...products];
            }
            
            // Apply filters and sorting
            applyFiltersAndSort();
            
            // Render products
            renderProducts();
            
            // Update UI
            updateResultsCount();
            updateLoadMoreButton();
            
        } catch (error) {
            console.error('Error loading products:', error);
            showErrorState();
        } finally {
            state.isLoading = false;
            hideLoadingState();
        }
    }
    
    // Simulate API call
    async function fetchProducts() {
        // In real app, this would be an actual API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const products = generateMockProducts();
                resolve(products);
            }, 1000);
        });
    }
    
    // Generate mock products for demonstration
    function generateMockProducts() {
        const productNames = [
            'Crystal Clear Glass Cleaner',
            'Anti-Fog Window Spray',
            'Eco-Friendly Glass Wipes',
            'Professional Glass Polish',
            'Streak-Free Mirror Cleaner',
            'Heavy-Duty Glass Cleaner',
            'Natural Glass Cleaning Kit',
            'Quick-Dry Window Cleaner',
            'Ammonia-Free Glass Spray',
            'Multi-Surface Glass Cleaner',
            'Car Window Cleaner',
            'Shower Glass Cleaner'
        ];
        
        const features = ['ammonia-free', 'anti-fog', 'rain-repellent', 'antibacterial'];
        const scents = ['unscented', 'fresh', 'citrus', 'mint'];
        const types = ['spray', 'refill', 'wipes', 'concentrate'];
        
        const startIndex = (state.currentPage - 1) * state.productsPerPage;
        const products = [];
        
        for (let i = 0; i < state.productsPerPage; i++) {
            const index = startIndex + i;
            if (index >= productNames.length * 3) break;
            
            const product = {
                id: index + 1,
                name: productNames[index % productNames.length],
                price: Math.floor(Math.random() * (500 - 150) + 150),
                originalPrice: Math.random() > 0.7 ? Math.floor(Math.random() * (600 - 300) + 300) : null,
                image: `images/products/glass-cleaner-${(index % 12) + 1}.jpg`,
                rating: (Math.random() * 2 + 3).toFixed(1),
                reviewCount: Math.floor(Math.random() * 200 + 10),
                description: 'Premium quality glass cleaner for streak-free shine',
                productType: types[Math.floor(Math.random() * types.length)],
                features: [features[Math.floor(Math.random() * features.length)]],
                scent: scents[Math.floor(Math.random() * scents.length)],
                badge: Math.random() > 0.8 ? ['Best Seller', 'New', 'Eco Choice'][Math.floor(Math.random() * 3)] : null,
                inStock: Math.random() > 0.1
            };
            
            products.push(product);
        }
        
        return products;
    }
    
    // ======================
    // Filtering & Sorting
    // ======================
    function applyFiltersAndSort() {
        // Start with all products
        let filtered = [...state.products];
        
        // Apply price filter
        filtered = filtered.filter(product => 
            product.price >= state.activeFilters.priceRange.min &&
            product.price <= state.activeFilters.priceRange.max
        );
        
        // Apply product type filter
        if (state.activeFilters.productType.length > 0) {
            filtered = filtered.filter(product =>
                state.activeFilters.productType.includes(product.productType)
            );
        }
        
        // Apply features filter
        if (state.activeFilters.features.length > 0) {
            filtered = filtered.filter(product =>
                product.features.some(feature => 
                    state.activeFilters.features.includes(feature)
                )
            );
        }
        
        // Apply scent filter
        if (state.activeFilters.scent.length > 0) {
            filtered = filtered.filter(product =>
                state.activeFilters.scent.includes(product.scent)
            );
        }
        
        // Apply rating filter
        if (state.activeFilters.rating > 0) {
            filtered = filtered.filter(product =>
                parseFloat(product.rating) >= state.activeFilters.rating
            );
        }
        
        // Apply sorting
        filtered = sortProducts(filtered, state.currentSort);
        
        state.filteredProducts = filtered;
    }
    
    function sortProducts(products, sortBy) {
        const sorted = [...products];
        
        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'rating':
                return sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
            case 'newest':
                return sorted.sort((a, b) => b.id - a.id);
            case 'bestselling':
                return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
            case 'featured':
            default:
                return sorted;
        }
    }
    
    // ======================
    // Rendering
    // ======================
    function renderProducts() {
        if (!elements.productsGrid) return;
        
        // Clear existing products if it's the first page
        if (state.currentPage === 1) {
            elements.productsGrid.innerHTML = '';
        }
        
        // Create product cards
        state.filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            elements.productsGrid.appendChild(productCard);
        });
        
        // Add animation
        animateProductCards();
    }
    
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.productId = product.id;
        
        const badge = product.badge ? `<span class="product-badge ${product.badge.toLowerCase().replace(' ', '-')}">${product.badge}</span>` : '';
        const originalPrice = product.originalPrice ? `<span class="original-price">${formatCurrency(product.originalPrice)}</span>` : '';
        const stockStatus = !product.inStock ? '<span class="out-of-stock">Out of Stock</span>' : '';
        
        card.innerHTML = `
            ${badge}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-overlay">
                    <button class="btn-icon add-to-cart" data-product='${JSON.stringify(product)}' ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="btn-icon quick-view" data-product='${JSON.stringify(product)}'>
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon add-to-wishlist" data-product-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                ${stockStatus}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    ${generateStarRating(product.rating)}
                    <span>(${product.rating})</span>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="current-price">${formatCurrency(product.price)}</span>
                    ${originalPrice}
                </div>
            </div>
        `;
        
        return card;
    }
    
    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    // ======================
    // Event Handlers
    // ======================
    function handleSortChange(e) {
        state.currentSort = e.target.value;
        state.currentPage = 1;
        applyFiltersAndSort();
        renderProducts();
    }
    
    function handleViewChange(e) {
        const btn = e.currentTarget;
        const view = btn.dataset.view;
        
        // Update active state
        elements.viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update view
        state.currentView = view;
        
        if (view === 'list') {
            elements.productsGrid.classList.add('list-view');
        } else {
            elements.productsGrid.classList.remove('list-view');
        }
    }
    
    function handlePriceRangeChange() {
        const minPrice = parseInt(elements.minPriceSlider.value);
        const maxPrice = parseInt(elements.maxPriceSlider.value);
        
        // Ensure min doesn't exceed max
        if (minPrice > maxPrice) {
            if (this === elements.minPriceSlider) {
                elements.maxPriceSlider.value = minPrice;
            } else {
                elements.minPriceSlider.value = maxPrice;
                            if (this === elements.minPriceSlider) {
                elements.maxPriceSlider.value = minPrice;
            } else {
                elements.minPriceSlider.value = maxPrice;
            }
        }
        
        // Update display values
        elements.minPriceValue.textContent = elements.minPriceSlider.value;
        elements.maxPriceValue.textContent = elements.maxPriceSlider.value;
        
        // Update state
        state.activeFilters.priceRange.min = parseInt(elements.minPriceSlider.value);
        state.activeFilters.priceRange.max = parseInt(elements.maxPriceSlider.value);
        
        // Apply filters with debounce
        debounce(() => {
            state.currentPage = 1;
            applyFiltersAndSort();
            renderProducts();
            updateResultsCount();
        }, 500)();
    }
    
    function handleFilterChange(e) {
        const checkbox = e.target;
        const filterType = checkbox.closest('.filter-group').querySelector('h4').textContent.toLowerCase().replace(' ', '');
        const value = checkbox.value;
        
        // Map filter types to state properties
        const filterMap = {
            'producttype': 'productType',
            'features': 'features',
            'scent': 'scent'
        };
        
        const stateProperty = filterMap[filterType];
        if (!stateProperty) return;
        
        if (checkbox.checked) {
            // Add to filter
            if (!state.activeFilters[stateProperty].includes(value)) {
                state.activeFilters[stateProperty].push(value);
            }
        } else {
            // Remove from filter
            const index = state.activeFilters[stateProperty].indexOf(value);
            if (index > -1) {
                state.activeFilters[stateProperty].splice(index, 1);
            }
        }
        
        // Apply filters
        state.currentPage = 1;
        applyFiltersAndSort();
        renderProducts();
        updateResultsCount();
        updateActiveFiltersDisplay();
    }
    
    function handleClearFilters() {
        // Reset all filters
        state.activeFilters = {
            priceRange: { min: 0, max: 1000 },
            productType: [],
            features: [],
            scent: [],
            rating: 0
        };
        
        // Reset UI
        elements.filterCheckboxes.forEach(checkbox => checkbox.checked = false);
        elements.minPriceSlider.value = 0;
        elements.maxPriceSlider.value = 1000;
        elements.minPriceValue.textContent = '0';
        elements.maxPriceValue.textContent = '1000';
        
        // Apply changes
        state.currentPage = 1;
        applyFiltersAndSort();
        renderProducts();
        updateResultsCount();
        updateActiveFiltersDisplay();
    }
    
    function handleLoadMore() {
        state.currentPage++;
        loadProducts();
    }
    
    function handleProductCardClick(e) {
        const target = e.target;
        
        // Add to cart
        if (target.closest('.add-to-cart')) {
            e.preventDefault();
            const button = target.closest('.add-to-cart');
            const product = JSON.parse(button.dataset.product);
            addToCart(product, button);
        }
        
        // Quick view
        if (target.closest('.quick-view')) {
            e.preventDefault();
            const button = target.closest('.quick-view');
            const product = JSON.parse(button.dataset.product);
            openQuickView(product);
        }
        
        // Add to wishlist
        if (target.closest('.add-to-wishlist')) {
            e.preventDefault();
            const button = target.closest('.add-to-wishlist');
            const productId = button.dataset.productId;
            toggleWishlist(productId, button);
        }
    }
    
    // ======================
    // Cart Functions
    // ======================
    function addToCart(product, button) {
        // Disable button temporarily
        button.disabled = true;
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Get cart from localStorage
        let cart = JSON.parse(localStorage.getItem('winzeeCart')) || [];
        
        // Check if product exists
        const existingIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingIndex !== -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        // Save cart
        localStorage.setItem('winzeeCart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Show success feedback
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check"></i>';
            
            // Show notification
            showNotification(`${product.name} added to cart!`, 'success');
            
            // Reset button after delay
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }, 1000);
        }, 500);
        
        // Animate cart icon
        animateCartIcon();
    }
    
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('winzeeCart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    function animateCartIcon() {
        const cartIcon = document.querySelector('.cart-btn');
        if (cartIcon) {
            cartIcon.classList.add('cart-animated');
            setTimeout(() => {
                cartIcon.classList.remove('cart-animated');
            }, 600);
        }
    }
    
    // ======================
    // Quick View Modal
    // ======================
    function openQuickView(product) {
        if (!elements.quickViewModal) return;
        
        const modalContent = elements.quickViewModal.querySelector('.quick-view-content');
        
        modalContent.innerHTML = `
            <div class="quick-view-grid">
                <div class="quick-view-images">
                    <div class="main-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="image-thumbnails">
                        <!-- Thumbnail images would go here -->
                    </div>
                </div>
                
                <div class="quick-view-info">
                    <h2 class="product-title">${product.name}</h2>
                    
                    <div class="product-rating">
                        ${generateStarRating(product.rating)}
                        <span>(${product.reviewCount} reviews)</span>
                    </div>
                    
                    <div class="product-price">
                        <span class="current-price">${formatCurrency(product.price)}</span>
                        ${product.originalPrice ? `<span class="original-price">${formatCurrency(product.originalPrice)}</span>` : ''}
                    </div>
                    
                    <div class="product-features">
                        <h4>Key Features:</h4>
                        <ul>
                            <li>Type: ${product.productType}</li>
                            <li>Scent: ${product.scent}</li>
                            <li>Features: ${product.features.join(', ')}</li>
                        </ul>
                    </div>
                    
                    <p class="product-description">
                        ${product.description}. Perfect for windows, mirrors, glass tables, and all glass surfaces. 
                        Our advanced formula ensures a streak-free shine every time.
                    </p>
                    
                    <div class="product-options">
                        <div class="quantity-selector">
                            <label>Quantity:</label>
                            <button class="qty-decrease">-</button>
                            <input type="number" value="1" min="1" class="qty-input" id="quickViewQty">
                            <button class="qty-increase">+</button>
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-primary add-to-cart-modal" data-product='${JSON.stringify(product)}'>
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn btn-outline add-to-wishlist-modal" data-product-id="${product.id}">
                            <i class="fas fa-heart"></i> Add to Wishlist
                        </button>
                    </div>
                    
                    <div class="product-meta">
                        <p><strong>SKU:</strong> GL-${product.id}</p>
                        <p><strong>Category:</strong> Glass Cleaners</p>
                        <p><strong>Availability:</strong> ${product.inStock ? 'In Stock' : 'Out of Stock'}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal
        elements.quickViewModal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Initialize quantity selector
        initQuickViewQuantity();
        
        // Add event listeners for modal buttons
        const addToCartBtn = modalContent.querySelector('.add-to-cart-modal');
        addToCartBtn.addEventListener('click', function() {
            const qty = parseInt(document.getElementById('quickViewQty').value);
            const productWithQty = { ...product, quantity: qty };
            addToCartFromModal(productWithQty, this);
        });
    }
    
    function initQuickViewQuantity() {
        const qtyInput = document.getElementById('quickViewQty');
        const decreaseBtn = qtyInput.previousElementSibling;
        const increaseBtn = qtyInput.nextElementSibling;
        
        decreaseBtn.addEventListener('click', () => {
            if (qtyInput.value > 1) {
                qtyInput.value = parseInt(qtyInput.value) - 1;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            qtyInput.value = parseInt(qtyInput.value) + 1;
        });
    }
    
    function addToCartFromModal(product, button) {
        addToCart(product, button);
        
        // Close modal after adding
        setTimeout(() => {
            elements.quickViewModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }, 1500);
    }
    
    // ======================
    // Wishlist Functions
    // ======================
    function toggleWishlist(productId, button) {
        let wishlist = JSON.parse(localStorage.getItem('winzeeWishlist')) || [];
        const index = wishlist.indexOf(productId);
        
        if (index === -1) {
            // Add to wishlist
            wishlist.push(productId);
            button.classList.add('active');
            showNotification('Added to wishlist!', 'success');
        } else {
            // Remove from wishlist
            wishlist.splice(index, 1);
            button.classList.remove('active');
            showNotification('Removed from wishlist', 'info');
        }
        
        localStorage.setItem('winzeeWishlist', JSON.stringify(wishlist));
        
        // Animate button
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 300);
    }
    
    // ======================
    // Review Functions
    // ======================
    function initStarRating() {
        let selectedRating = 0;
        
        elements.starRatingInputs.forEach((star, index) => {
            star.addEventListener('mouseenter', function() {
                highlightStars(index + 1);
            });
            
            star.addEventListener('mouseleave', function() {
                highlightStars(selectedRating);
            });
            
            star.addEventListener('click', function() {
                selectedRating = index + 1;
                star.dataset.rating = selectedRating;
                highlightStars(selectedRating);
            });
        });
    }
    
    function highlightStars(rating) {
        elements.starRatingInputs.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    }
    
    function openReviewModal() {
        elements.reviewModal.classList.add('active');
        document.body.classList.add('modal-open');
    }
    
    function handleReviewSubmit(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        // Simulate API call
        setTimeout(() => {
            // Close modal
            elements.reviewModal.classList.remove('active');
            document.body.classList.remove('modal-open');
            
            // Reset form
            e.target.reset();
            highlightStars(0);
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // Show success notification
            showNotification('Thank you for your review! It will be published after moderation.', 'success');
        }, 2000);
    }
    
    // ======================
    // UI Updates
    // ======================
    function updateResultsCount() {
        if (elements.resultsCount) {
            elements.resultsCount.textContent = state.filteredProducts.length;
        }
    }
    
    function updateLoadMoreButton() {
        if (!elements.loadMoreBtn) return;
        
        const totalProducts = state.filteredProducts.length;
        const displayedProducts = state.currentPage * state.productsPerPage;
        
        if (displayedProducts >= totalProducts) {
            elements.loadMoreBtn.style.display = 'none';
        } else {
            elements.loadMoreBtn.style.display = 'inline-flex';
            elements.loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Products';
        }
    }
    
    function updateActiveFiltersDisplay() {
        // This could show active filter tags above the products
        // Implementation depends on UI design
    }
    
    // ======================
    // Loading States
    // ======================
    function showLoadingState() {
        if (state.currentPage === 1 && elements.productsGrid) {
            elements.productsGrid.innerHTML = generateSkeletonCards();
        }
        
        if (elements.loadMoreBtn && state.currentPage > 1) {
            elements.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            elements.loadMoreBtn.disabled = true;
        }
    }
    
    function hideLoadingState() {
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.disabled = false;
        }
    }
    
        function hideLoadingState() {
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.disabled = false;
        }
    }
    
    function generateSkeletonCards() {
        let skeletons = '';
        for (let i = 0; i < 6; i++) {
            skeletons += `
                <div class="product-card skeleton">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-rating"></div>
                        <div class="skeleton-price"></div>
                    </div>
                </div>
            `;
        }
        return skeletons;
    }
    
    function showErrorState() {
        if (elements.productsGrid) {
            elements.productsGrid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>We couldn't load the products. Please try again.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }
    
    // ======================
    // Animations
    // ======================
    function animateProductCards() {
        const cards = elements.productsGrid.querySelectorAll('.product-card:not(.animated)');
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.classList.add('animated');
            }, index * 50);
        });
    }
    
    // ======================
    // Notifications
    // ======================
    function showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let notificationContainer = document.getElementById('notificationContainer');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationContainer';
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Set icon based on type
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto remove after 5 seconds
        const autoRemove = setTimeout(() => {
            removeNotification(notification);
        }, 5000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', function() {
            clearTimeout(autoRemove);
            removeNotification(notification);
        });
    }
    
    function removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
    
    // ======================
    // Utility Functions
    // ======================
    function formatCurrency(amount) {
        const formatted = amount.toFixed(CURRENCY_CONFIG.decimal);
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, CURRENCY_CONFIG.thousand);
        const finalAmount = parts.join('.');
        
        return CURRENCY_CONFIG.position === 'before' 
            ? `${CURRENCY_CONFIG.symbol}${finalAmount}`
            : `${finalAmount}${CURRENCY_CONFIG.symbol}`;
    }
    
    function getCategoryId() {
        // Get from URL parameter or page data
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('category') || document.body.dataset.categoryId || 'glass-cleaners';
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // ======================
    // Responsive Handling
    // ======================
    function handleResize() {
        // Adjust products per page based on screen size
        if (window.innerWidth < 768) {
            state.productsPerPage = 6;
        } else if (window.innerWidth < 1200) {
            state.productsPerPage = 9;
        } else {
            state.productsPerPage = 12;
        }
    }
    
    // ======================
    // Filter Initialization
    // ======================
    function initFilters() {
        // Set initial filter counts
        updateFilterCounts();
        
        // Initialize price range
        if (elements.minPriceSlider && elements.maxPriceSlider) {
            elements.minPriceSlider.value = state.activeFilters.priceRange.min;
            elements.maxPriceSlider.value = state.activeFilters.priceRange.max;
            elements.minPriceValue.textContent = state.activeFilters.priceRange.min;
            elements.maxPriceValue.textContent = state.activeFilters.priceRange.max;
        }
        
        // Check for URL parameters
        applyURLFilters();
    }
    
    function updateFilterCounts() {
        // In a real app, this would come from the API
        const counts = {
            'spray': 8,
            'refill': 5,
            'wipes': 3,
            'concentrate': 4,
            'ammonia-free': 15,
            'anti-fog': 6,
            'rain-repellent': 4,
            'antibacterial': 7,
            'unscented': 8,
            'fresh': 6,
            'citrus': 4,
            'mint': 2
        };
        
        elements.filterCheckboxes.forEach(checkbox => {
            const countSpan = checkbox.parentElement.querySelector('.count');
            if (countSpan && counts[checkbox.value]) {
                countSpan.textContent = `(${counts[checkbox.value]})`;
            }
        });
    }
    
    function applyURLFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Apply filters from URL
        const filters = urlParams.get('filters');
        if (filters) {
            try {
                const filterData = JSON.parse(decodeURIComponent(filters));
                Object.assign(state.activeFilters, filterData);
                
                // Update UI to reflect filters
                updateFilterUI();
            } catch (e) {
                console.error('Error parsing filters from URL:', e);
            }
        }
    }
    
    function updateFilterUI() {
        // Update checkboxes
        elements.filterCheckboxes.forEach(checkbox => {
            const filterType = getFilterType(checkbox);
            if (state.activeFilters[filterType] && 
                state.activeFilters[filterType].includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });
        
        // Update price range
        if (elements.minPriceSlider && elements.maxPriceSlider) {
            elements.minPriceSlider.value = state.activeFilters.priceRange.min;
            elements.maxPriceSlider.value = state.activeFilters.priceRange.max;
            elements.minPriceValue.textContent = state.activeFilters.priceRange.min;
            elements.maxPriceValue.textContent = state.activeFilters.priceRange.max;
        }
    }
    
    function getFilterType(checkbox) {
        const filterGroup = checkbox.closest('.filter-group').querySelector('h4').textContent.toLowerCase();
        const filterMap = {
            'product type': 'productType',
            'features': 'features',
            'scent': 'scent'
        };
        return filterMap[filterGroup] || null;
    }
    
    // ======================
    // Tooltips
    // ======================
    function initTooltips() {
        // Initialize tooltips for product features
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
        });
    }
    
    function showTooltip(e) {
        const element = e.target;
        const tooltipText = element.dataset.tooltip;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        
        // Store reference
        element._tooltip = tooltip;
        
        // Animate in
        setTimeout(() => {
            tooltip.classList.add('show');
        }, 10);
    }
    
    function hideTooltip(e) {
        const tooltip = e.target._tooltip;
        if (tooltip) {
            tooltip.classList.remove('show');
            setTimeout(() => {
                tooltip.remove();
            }, 300);
            delete e.target._tooltip;
        }
    }
    
    // ======================
    // Modal Management
    // ======================
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    });
    
    // Close modals with close button
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    });
    
    // Close modals with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        }
    });
    
    // ======================
    // Analytics
    // ======================
    function trackEvent(category, action, label, value) {
        // Google Analytics or other analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label,
                'value': value
            });
        }
    }
    
    // Track product views
    function trackProductView(product) {
        trackEvent('Product', 'view', product.name, product.price);
    }
    
    // Track add to cart
    function trackAddToCart(product) {
        trackEvent('Product', 'add_to_cart', product.name, product.price);
    }
    
    // ======================
    // Initialize Everything
    // ======================
    init();
});

// ======================
// CSS for skeleton loading and animations
// ======================
const style = document.createElement('style');
style.textContent = `
    /* Skeleton Loading */
    .skeleton {
        pointer-events: none;
    }
    
    .skeleton-image {
        height: 280px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
    }
    
    .skeleton-content {
        padding: var(--spacing-md);
    }
    
    .skeleton-title,
    .skeleton-rating,
    .skeleton-price {
        height: 20px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        margin-bottom: var(--spacing-sm);
        border-radius: var(--radius-sm);
    }
    
    .skeleton-title {
        width: 80%;
    }
    
    .skeleton-rating {
        width: 60%;
    }
    
    .skeleton-price {
        width: 40%;
    }
    
    @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    
    /* Cart Animation */
    .cart-animated {
        animation: cartPulse 0.6s ease-in-out;
    }
    
    @keyframes cartPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    /* Error State */
    .error-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--spacing-2xl);
    }
    
    .error-state i {
        font-size: 3rem;
        color: var(--warning-color);
        margin-bottom: var(--spacing-md);
    }
    
    /* Tooltip */
    .tooltip {
        position: fixed;
        background: var(--text-dark);
        color: var(--text-white);
        padding: 8px 12px;
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        opacity: 0;
        transform: translateY(-5px);
        transition: all 0.3s ease;
        z-index: 1000;
        pointer-events: none;
    }
    
    .tooltip.show {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);