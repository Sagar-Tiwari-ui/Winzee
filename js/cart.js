// cart.js - Shopping Cart functionality for Winzee website
// Author: Winzee Development Team
// Version: 1.0.0

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ======================
    // Cart Configuration
    // ======================
    const CURRENCY_CONFIG = {
        symbol: '₹',
        code: 'INR',
        position: 'before',
        decimal: 2,
        thousand: ',',
        freeShippingThreshold: 500,
        shippingCost: 50,
        taxRate: 0.18 // 18% GST
    };
    
    // Available coupon codes
    const COUPON_CODES = {
        'WELCOME10': { discount: 0.10, type: 'percentage', message: '10% discount applied!' },
        'SAVE50': { discount: 50, type: 'fixed', message: '₹50 discount applied!' },
        'FREESHIP': { discount: 0, type: 'shipping', message: 'Free shipping applied!' },
        'WINZEE20': { discount: 0.20, type: 'percentage', message: '20% discount applied!' }
    };
    
    // ======================
    // Global Variables
    // ======================
    let cart = JSON.parse(localStorage.getItem('winzeeCart')) || [];
    let appliedCoupon = null;
    let itemToDelete = null;
    
    // DOM Elements
    const cartContent = document.getElementById('cartContent');
    const emptyCart = document.getElementById('emptyCart');
    const cartItemsWrapper = document.getElementById('cartItemsWrapper');
    const cartTableBody = document.getElementById('cartTableBody');
    const cartItemsMobile = document.getElementById('cartItemsMobile');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartDiscount = document.getElementById('cartDiscount');
    const shippingCost = document.getElementById('shippingCost');
    const cartTax = document.getElementById('cartTax');
    const cartTotal = document.getElementById('cartTotal');
    const shippingMessage = document.getElementById('shippingMessage');
    const couponForm = document.getElementById('couponForm');
    const couponCode = document.getElementById('couponCode');
    const couponMessage = document.getElementById('couponMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCart');
    const deleteModal = document.getElementById('deleteModal');
    const clearCartModal = document.getElementById('clearCartModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const confirmClearCartBtn = document.getElementById('confirmClearCart');
    
    // ======================
    // Currency Formatting
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
    
    // ======================
    // Initialize Cart Page
    // ======================
    function initializeCart() {
        // Load cart from localStorage
        cart = JSON.parse(localStorage.getItem('winzeeCart')) || [];
        
        // Check if cart is empty
        if (cart.length === 0) {
            showEmptyCart();
        } else {
            showCartItems();
            updateCartSummary();
        }
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Load recently viewed products
        loadRecentlyViewed();
        
        // Load recommended products
        loadRecommendedProducts();
    }
    
    // ======================
    // Display Functions
    // ======================
    function showEmptyCart() {
        emptyCart.style.display = 'block';
        if (cartItemsWrapper) {
            cartItemsWrapper.style.display = 'none';
        }
    }
    
    function showCartItems() {
        emptyCart.style.display = 'none';
        if (cartItemsWrapper) {
            cartItemsWrapper.style.display = 'block';
        }
        
        // Clear existing items
        cartTableBody.innerHTML = '';
        cartItemsMobile.innerHTML = '';
        
        // Add items to both desktop and mobile views
        cart.forEach((item, index) => {
            addCartItemToTable(item, index);
            addCartItemToMobile(item, index);
        });
    }
    
    // Add item to desktop table
    function addCartItemToTable(item, index) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>SKU: ${item.id}</p>
                    </div>
                </div>
            </td>
            <td class="cart-item-price">${formatCurrency(item.price)}</td>
            <td>
                <div class="quantity-control">
                    <button class="qty-decrease" data-index="${index}">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" data-index="${index}">
                    <button class="qty-increase" data-index="${index}">+</button>
                </div>
            </td>
            <td class="cart-item-total">${formatCurrency(item.price * item.quantity)}</td>
            <td>
                <button class="remove-item" data-index="${index}" aria-label="Remove item">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        
        cartTableBody.appendChild(row);
    }
    
    // Add item to mobile view
    function addCartItemToMobile(item, index) {
        const mobileItem = document.createElement('div');
        mobileItem.className = 'cart-item-mobile';
        mobileItem.innerHTML = `
            <div class="cart-item-mobile-header">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-mobile-details">
                    <h4>${item.name}</h4>
                    <p>SKU: ${item.id}</p>
                    <p class="cart-item-price">${formatCurrency(item.price)}</p>
                </div>
                <button class="remove-item" data-index="${index}" aria-label="Remove item">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="cart-item-mobile-footer">
                <div class="quantity-control">
                    <button class="qty-decrease" data-index="${index}">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" data-index="${index}">
                    <button class="qty-increase" data-index="${index}">+</button>
                </div>
                <div class="cart-item-total">
                    <span>Total: </span>
                    <strong>${formatCurrency(item.price * item.quantity)}</strong>
                </div>
            </div>
        `;
        
        cartItemsMobile.appendChild(mobileItem);
    }
    
    // ======================
    // Cart Summary Calculations
    // ======================
    function updateCartSummary() {
        // Calculate subtotal
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Calculate discount
        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.type === 'percentage') {
                discount = subtotal * appliedCoupon.discount;
            } else if (appliedCoupon.type === 'fixed') {
                discount = appliedCoupon.discount;
            }
        }
        
        // Calculate shipping
        let shipping = 0;
        if (appliedCoupon && appliedCoupon.type === 'shipping') {
            shipping = 0;
        } else if (subtotal < CURRENCY_CONFIG.freeShippingThreshold) {
            shipping = CURRENCY_CONFIG.shippingCost;
        }
        
        // Calculate tax (on subtotal - discount)
        const taxableAmount = subtotal - discount;
        const tax = taxableAmount * CURRENCY_CONFIG.taxRate;
        
        // Calculate total
        const total = taxableAmount + shipping + tax;
        
        // Update DOM
        cartSubtotal.textContent = formatCurrency(subtotal);
        cartDiscount.textContent = discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0);
        shippingCost.textContent = formatCurrency(shipping);
        cartTax.textContent = formatCurrency(tax);
        cartTotal.textContent = formatCurrency(total);
        
        // Update shipping message
        updateShippingMessage(subtotal, shipping);
        
        // Update cart count in header
        updateCartCount();
    }
    
    function updateShippingMessage(subtotal, shipping) {
        const messageSpan = shippingMessage.querySelector('span');
        
        if (shipping === 0) {
            shippingMessage.classList.add('free-shipping');
            messageSpan.textContent = 'You qualify for free shipping!';
        } else {
            shippingMessage.classList.remove('free-shipping');
            const remaining = CURRENCY_CONFIG.freeShippingThreshold - subtotal;
            messageSpan.textContent = `Add ${formatCurrency(remaining)} more for free shipping`;
        }
    }
    
    // ======================
    // Cart Operations
    // ======================
    function updateQuantity(index, newQuantity) {
        if (newQuantity < 1) return;
        
        cart[index].quantity = parseInt(newQuantity);
        saveCart();
        showCartItems();
        updateCartSummary();
        
        // Show notification
        showNotification('Cart updated', 'success');
    }
    
    function removeItem(index) {
        const removedItem = cart.splice(index, 1)[0];
        saveCart();
        
        if (cart.length === 0) {
            showEmptyCart();
            appliedCoupon = null;
            couponMessage.textContent = '';
        } else {
            showCartItems();
            updateCartSummary();
        }
        
        // Show notification
        showNotification(`${removedItem.name} removed from cart`, 'info');
    }
    
    function clearCart() {
        cart = [];
        appliedCoupon = null;
        saveCart();
        showEmptyCart();
        couponMessage.textContent = '';
        
        // Show notification
        showNotification('Cart cleared', 'info');
    }
    
    function saveCart() {
        localStorage.setItem('winzeeCart', JSON.stringify(cart));
        updateCartCount();
    }
    
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    // ======================
    // Coupon Functionality
    // ======================
    function applyCoupon(code) {
        const upperCode = code.toUpperCase();
        
        if (COUPON_CODES[upperCode]) {
            appliedCoupon = COUPON_CODES[upperCode];
            couponMessage.textContent = appliedCoupon.message;
            couponMessage.className = 'coupon-message success';
            couponCode.value = '';
            updateCartSummary();
            
            // Show notification
            showNotification(appliedCoupon.message, 'success');
        } else {
            couponMessage.textContent = 'Invalid coupon code';
            couponMessage.className = 'coupon-message error';
            
            // Show notification
            showNotification('Invalid coupon code', 'error');
        }
    }
    
    // ======================
    // Event Listeners
    // ======================
    function initializeEventListeners() {
        // Quantity controls
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('qty-decrease')) {
                const index = parseInt(e.target.dataset.index);
                const currentQty = cart[index].quantity;
                if (currentQty > 1) {
                    updateQuantity(index, currentQty - 1);
                }
            }
            
            if (e.target.classList.contains('qty-increase')) {
                const index = parseInt(e.target.dataset.index);
                const currentQty = cart[index].quantity;
                updateQuantity(index, currentQty + 1);
            }
            
            if (e.target.classList.contains('remove-item') || e.target.parentElement.classList.contains('remove-item')) {
                const button = e.target.classList.contains('remove-item') ? e.target : e.target.parentElement;
                itemToDelete = parseInt(button.dataset.index);
                openModal(deleteModal);
            }
        });
        
        // Quantity input change
        document.addEventListener('change', function(e) {
            if (e.target.classList.contains('qty-input')) {
                const index = parseInt(e.target.dataset.index);
                const newQty = parseInt(e.target.value);
                updateQuantity(index, newQty);
            }
        });
        
        // Coupon form
        if (couponForm) {
            couponForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const code = couponCode.value.trim();
                if (code) {
                    applyCoupon(code);
                }
            });
        }
        
        // Clear cart button
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', function() {
                openModal(clearCartModal);
            });
        }
        
        // Checkout button
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.length > 0) {
                    // Save checkout data
                    const checkoutData = {
                        items: cart,
                        subtotal: calculateSubtotal(),
                        discount: calculateDiscount(),
                        shipping: calculateShipping(),
                        tax: calculateTax(),
                        total: calculateTotal(),
                        coupon: appliedCoupon
                    };
                    
                    localStorage.setItem('winzeeCheckout', JSON.stringify(checkoutData));
                    
                    // Redirect to checkout page
                    window.location.href = 'checkout.html';
                }
            });
        }
        
        // Modal confirmations
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', function() {
                if (itemToDelete !== null) {
                    removeItem(itemToDelete);
                    itemToDelete = null;
                    closeModal(deleteModal);
                }
            });
        }
        
        if (confirmClearCartBtn) {
            confirmClearCartBtn.addEventListener('click', function() {
                clearCart();
                closeModal(clearCartModal);
            });
        }
        
        // Modal close buttons
        document.querySelectorAll('[data-modal-close]').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });
        
        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal(this);
                }
            });
        });
    }
    
        // ======================
    // Helper Functions
    // ======================
    function calculateSubtotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    function calculateDiscount() {
        if (!appliedCoupon) return 0;
        
        const subtotal = calculateSubtotal();
        
        if (appliedCoupon.type === 'percentage') {
            return subtotal * appliedCoupon.discount;
        } else if (appliedCoupon.type === 'fixed') {
            return appliedCoupon.discount;
        }
        
        return 0;
    }
    
    function calculateShipping() {
        const subtotal = calculateSubtotal();
        
        if (appliedCoupon && appliedCoupon.type === 'shipping') {
            return 0;
        }
        
        return subtotal >= CURRENCY_CONFIG.freeShippingThreshold ? 0 : CURRENCY_CONFIG.shippingCost;
    }
    
    function calculateTax() {
        const subtotal = calculateSubtotal();
        const discount = calculateDiscount();
        const taxableAmount = subtotal - discount;
        
        return taxableAmount * CURRENCY_CONFIG.taxRate;
    }
    
    function calculateTotal() {
        const subtotal = calculateSubtotal();
        const discount = calculateDiscount();
        const shipping = calculateShipping();
        const tax = calculateTax();
        
        return subtotal - discount + shipping + tax;
    }
    
    // ======================
    // Modal Functions
    // ======================
    function openModal(modal) {
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }
    
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }
    
    // ======================
    // Notification System
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
    // Recently Viewed Products
    // ======================
    function loadRecentlyViewed() {
        const recentlyViewedContainer = document.getElementById('recentlyViewed');
        if (!recentlyViewedContainer) return;
        
        // Get recently viewed from localStorage (in real app, this might come from an API)
        const recentlyViewed = JSON.parse(localStorage.getItem('winzeeRecentlyViewed')) || [];
        
        if (recentlyViewed.length === 0) {
            recentlyViewedContainer.parentElement.style.display = 'none';
            return;
        }
        
        // Sample product data (in real app, fetch based on IDs)
        const products = [
            {
                id: 5,
                name: 'Eco-Friendly Dish Soap',
                price: 249.00,
                image: 'images/products/dish-soap.jpg',
                rating: 4.6
            },
            {
                id: 6,
                name: 'Natural Floor Cleaner',
                price: 399.00,
                image: 'images/products/floor-cleaner.jpg',
                rating: 4.7
            },
            {
                id: 7,
                name: 'Antibacterial Surface Spray',
                price: 299.00,
                image: 'images/products/surface-spray.jpg',
                rating: 4.8
            },
            {
                id: 8,
                name: 'Lavender Fabric Softener',
                price: 349.00,
                image: 'images/products/fabric-softener.jpg',
                rating: 4.5
            }
        ];
        
        // Display products
        products.slice(0, 4).forEach(product => {
            const productCard = createProductCard(product);
            recentlyViewedContainer.appendChild(productCard);
        });
    }
    
    // ======================
    // Recommended Products
    // ======================
    function loadRecommendedProducts() {
        const recommendedContainer = document.getElementById('recommendedProducts');
        if (!recommendedContainer) return;
        
        // Sample recommended products (in real app, this would be based on cart items)
        const recommendedProducts = [
            {
                id: 9,
                name: 'Stain Remover Spray',
                price: 199.00,
                image: 'images/products/stain-remover.jpg',
                rating: 4.9,
                badge: 'Hot Deal'
            },
            {
                id: 10,
                name: 'Toilet Bowl Cleaner',
                price: 179.00,
                image: 'images/products/toilet-cleaner.jpg',
                rating: 4.4
            },
            {
                id: 11,
                name: 'Microfiber Cleaning Cloths',
                price: 299.00,
                image: 'images/products/microfiber-cloths.jpg',
                rating: 4.7,
                badge: 'Bundle Deal'
            },
            {
                id: 12,
                name: 'Oven & Grill Cleaner',
                price: 349.00,
                image: 'images/products/oven-cleaner.jpg',
                rating: 4.6
            }
        ];
        
        // Display products
        recommendedProducts.forEach(product => {
            const productCard = createProductCard(product);
            recommendedContainer.appendChild(productCard);
        });
    }
    
    // ======================
    // Create Product Card
    // ======================
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-overlay">
                    <button class="btn-icon add-to-cart-quick" data-product='${JSON.stringify(product)}'>
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="btn-icon quick-view" data-product-id="${product.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon add-to-wishlist" data-product-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">${generateStarRating(product.rating)}</div>
                <div class="product-price">${formatCurrency(product.price)}</div>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.add-to-cart-quick').addEventListener('click', function(e) {
            e.preventDefault();
            const productData = JSON.parse(this.dataset.product);
            addToCartQuick(productData);
        });
        
        return card;
    }
    
    // Generate star rating HTML
    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
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
    // Add to Cart from Product Cards
    // ======================
    function addToCartQuick(product) {
        // Check if product already exists in cart
        const existingItemIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex !== -1) {
            // Increase quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        // Save and update
        saveCart();
        showCartItems();
        updateCartSummary();
        
        // Show notification
        showNotification(`${product.name} added to cart!`, 'success');
        
        // Animate cart icon
        animateCartIcon();
    }
    
    // ======================
    // Cart Icon Animation
    // ======================
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
    // Save for Later Functionality
    // ======================
    function saveForLater(index) {
        const item = cart[index];
        let savedItems = JSON.parse(localStorage.getItem('winzeeSavedForLater')) || [];
        
        // Add to saved items
        savedItems.push(item);
        localStorage.setItem('winzeeSavedForLater', JSON.stringify(savedItems));
        
        // Remove from cart
        cart.splice(index, 1);
        saveCart();
        
        if (cart.length === 0) {
            showEmptyCart();
        } else {
            showCartItems();
            updateCartSummary();
        }
        
        showNotification('Item saved for later', 'success');
    }
    
    // ======================
    // Print Cart Functionality
    // ======================
    function printCart() {
        window.print();
    }
    
    // ======================
    // Share Cart Functionality
    // ======================
    function shareCart() {
        const cartUrl = window.location.href;
        const cartText = `Check out my Winzee cart with ${cart.length} items!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Winzee Cart',
                text: cartText,
                url: cartUrl
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback - copy to clipboard
            const textToCopy = `${cartText} ${cartUrl}`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification('Cart link copied to clipboard!', 'success');
            });
        }
    }
    
    // ======================
    // Estimate Delivery Date
    // ======================
    function getEstimatedDelivery() {
        const today = new Date();
        const deliveryDays = 3 + Math.floor(Math.random() * 3); // 3-5 days
        const deliveryDate = new Date(today.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return deliveryDate.toLocaleDateString('en-US', options);
    }
    
    // ======================
    // Cart Persistence
    // ======================
    function syncCart() {
        // In a real app, this would sync with server
        console.log('Syncing cart with server...');
        
        // Simulate API call
        setTimeout(() => {
            console.log('Cart synced successfully');
        }, 1000);
    }
    
    // ======================
    // Auto-save Cart
    // ======================
    let autoSaveTimer;
    function autoSaveCart() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            saveCart();
            syncCart();
        }, 2000);
    }
    
    // ======================
    // Initialize Cart
    // ======================
    initializeCart();
    
    // ======================
    // Add CSS for cart animation
    // ======================
    const style = document.createElement('style');
    style.textContent = `
        .cart-animated {
            animation: cartPulse 0.6s ease-in-out;
        }
        
        @keyframes cartPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});

// ======================
// Global Cart Functions (accessible from other scripts)
// ======================
window.WinzeeCart = {
    addItem: function(product) {
        // Implementation for adding items from other pages
    },
    
    getCartCount: function() {
        const cart = JSON.parse(localStorage.getItem('winzeeCart')) || [];
        return cart.reduce((total, item) => total + item.quantity, 0);
    },
    
    getCartTotal: function() {
        const cart = JSON.parse(localStorage.getItem('winzeeCart')) || [];
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
};