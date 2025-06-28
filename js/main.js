// main.js - Main JavaScript file for Winzee website
// Author: Winzee Development Team
// Version: 1.0.0

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ======================
    // Global Variables
    // ======================
    const header = document.getElementById('header');
    const navbar = document.getElementById('navbar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');
    const backToTopBtn = document.getElementById('backToTop');
    const preloader = document.getElementById('preloader');
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    const newsletterForm = document.getElementById('newsletterForm');
    const liveChatWidget = document.getElementById('liveChatWidget');
    const chatToggle = document.getElementById('chatToggle');
    
    // ======================
    // Preloader
    // ======================
    window.addEventListener('load', function() {
        // Hide preloader after page loads
        setTimeout(function() {
            if (preloader) {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
                setTimeout(function() {
                    preloader.style.display = 'none';
                }, 500);
            }
        }, 500);
    });
    
    // ======================
    // Mobile Menu Toggle
    // ======================
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            // Toggle mobile menu
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            
            // Toggle body scroll
            document.body.classList.toggle('menu-open');
            
            // Animate hamburger menu
            const spans = mobileMenuToggle.querySelectorAll('span');
            if (mobileMenuToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
    
    // ======================
    // Dropdown Menu Handling
    // ======================
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        // Desktop hover functionality
        if (window.innerWidth > 768) {
            dropdown.addEventListener('mouseenter', function() {
                menu.style.display = 'block';
                setTimeout(() => {
                    menu.style.opacity = '1';
                    menu.style.transform = 'translateY(0)';
                }, 10);
            });
            
            dropdown.addEventListener('mouseleave', function() {
                menu.style.opacity = '0';
                menu.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    menu.style.display = 'none';
                }, 300);
            });
        }
        
        // Mobile click functionality
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
                
                // Close other dropdowns
                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove('active');
                    }
                });
            }
        });
    });
    
    // ======================
    // Sticky Header on Scroll
    // ======================
    let lastScrollTop = 0;
    let scrollThreshold = 100;
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove sticky class
        if (scrollTop > scrollThreshold) {
            navbar.classList.add('sticky');
            
            // Hide/show navbar based on scroll direction
            if (scrollTop > lastScrollTop && scrollTop > 300) {
                // Scrolling down
                navbar.classList.add('hidden');
            } else {
                // Scrolling up
                navbar.classList.remove('hidden');
            }
        } else {
            navbar.classList.remove('sticky');
            navbar.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // ======================
    // Search Overlay
    // ======================
    if (searchBtn && searchOverlay && closeSearch) {
        // Open search overlay
        searchBtn.addEventListener('click', function() {
            searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on search input
            setTimeout(() => {
                const searchInput = searchOverlay.querySelector('input[type="search"]');
                if (searchInput) searchInput.focus();
            }, 300);
        });
        
        // Close search overlay
        closeSearch.addEventListener('click', closeSearchOverlay);
        
        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                closeSearchOverlay();
            }
        });
        
        // Close when clicking outside search container
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                closeSearchOverlay();
            }
        });
    }
    
    function closeSearchOverlay() {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // ======================
    // Back to Top Button
    // ======================
    if (backToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // Smooth scroll to top
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ======================
    // Hero Slider
    // ======================
    const heroSlides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;
    
    if (heroSlides.length > 1) {
        // Auto-advance slides
        setInterval(function() {
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
        }, 5000);
    }
    
    // ======================
    // Featured Products Loading
    // ======================
    function loadFeaturedProducts() {
        const productsGrid = document.querySelector('.products-grid');
        
        if (productsGrid) {
            // Sample product data (in real app, this would come from an API)
            const products = [
                {
                    id: 1,
                    name: 'All-Purpose Cleaner',
                    price: 12.99,
                    image: 'images/products/all-purpose-cleaner.jpg',
                    rating: 4.5,
                    badge: 'Best Seller'
                },
                {
                    id: 2,
                    name: 'Kitchen Degreaser',
                    price: 14.99,
                    image: 'images/products/kitchen-degreaser.jpg',
                    rating: 4.8,
                    badge: 'New'
                },
                {
                    id: 3,
                    name: 'Bathroom Cleaner',
                    price: 13.99,
                    image: 'images/products/bathroom-cleaner.jpg',
                    rating: 4.6,
                    badge: null
                },
                {
                    id: 4,
                    name: 'Glass Cleaner',
                    price: 9.99,
                    image: 'images/products/glass-cleaner.jpg',
                    rating: 4.7,
                    badge: 'Eco Choice'
                }
            ];
            
            // Generate product cards
            products.forEach(product => {
                const productCard = createProductCard(product);
                productsGrid.appendChild(productCard);
            });
        }
    }
    
    // Create product card element
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-overlay">
                    <button class="btn-icon add-to-cart" data-product-id="${product.id}">
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
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
        `;
        
        // Add event listeners to buttons
        const addToCartBtn = card.querySelector('.add-to-cart');
        const quickViewBtn = card.querySelector('.quick-view');
        const wishlistBtn = card.querySelector('.add-to-wishlist');
        
        addToCartBtn.addEventListener('click', () => addToCart(product));
        quickViewBtn.addEventListener('click', () => openQuickView(product));
        wishlistBtn.addEventListener('click', (e) => toggleWishlist(e.target, product));
        
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
    // Shopping Cart Functions
    // ======================
    let cart = JSON.parse(localStorage.getItem('winzeeCart')) || [];
    
    function addToCart(product) {
        // Check if product already exists in cart
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        // Save to localStorage
        localStorage.setItem('winzeeCart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Show success notification
        showNotification('Product added to cart!', 'success');
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
    // Quick View Modal
    // ======================
    function openQuickView(product) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('quickViewModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quickViewModal';
            modal.className = 'modal quick-view-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <div class="quick-view-content">
                        <div class="quick-view-image">
                            <img src="" alt="">
                        </div>
                        <div class="quick-view-info">
                            <h2 class="product-title"></h2>
                            <div class="product-rating"></div>
                            <div class="product-price"></div>
                            <p class="product-description"></p>
                            <div class="product-options">
                                <div class="quantity-selector">
                                    <button class="qty-decrease">-</button>
                                    <input type="number" value="1" min="1" class="qty-input">
                                    <button class="qty-increase">+</button>
                                </div>
                                <button class="btn btn-primary add-to-cart-modal">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Update modal content
        modal.querySelector('.quick-view-image img').src = product.image;
        modal.querySelector('.product-title').textContent = product.name;
        modal.querySelector('.product-rating').innerHTML = generateStarRating(product.rating);
        modal.querySelector('.product-price').textContent = `$${product.price.toFixed(2)}`;
        modal.querySelector('.product-description').textContent = 'Premium quality cleaner that effectively removes dirt and grime while being gentle on surfaces.';
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Close modal functionality
        modal.querySelector('.modal-close').onclick = () => closeModal(modal);
        modal.onclick = (e) => {
            if (e.target === modal) closeModal(modal);
        };
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // ======================
    // Wishlist Functions
    // ======================
    let wishlist = JSON.parse(localStorage.getItem('winzeeWishlist')) || [];
    
    function toggleWishlist(button, product) {
        const index = wishlist.findIndex(item => item.id === product.id);
        
        if (index === -1) {
            // Add to wishlist
            wishlist.push(product);
            button.classList.add('active');
            showNotification('Added to wishlist!', 'success');
        } else {
            // Remove from wishlist
            wishlist.splice(index, 1);
            button.classList.remove('active');
            showNotification('Removed from wishlist', 'info');
        }
        
        // Save to localStorage
        localStorage.setItem('winzeeWishlist', JSON.stringify(wishlist));
    }
    
        // ======================
    // Newsletter Form
    // ======================
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            
            // Simulate API call
            setTimeout(() => {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Subscribe';
                
                // Show success message
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                
                // Reset form
                this.reset();
                
                // Store subscription status
                localStorage.setItem('newsletterSubscribed', 'true');
            }, 1500);
        });
    }
    
    // ======================
    // Cookie Consent
    // ======================
    if (cookieConsent && acceptCookiesBtn) {
        // Check if user has already accepted cookies
        if (!localStorage.getItem('cookiesAccepted')) {
            setTimeout(() => {
                cookieConsent.classList.add('show');
            }, 2000);
        }
        
        acceptCookiesBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieConsent.classList.remove('show');
            
            // Initialize analytics after consent
            initializeAnalytics();
        });
    }
    
    // ======================
    // Live Chat Widget
    // ======================
    if (chatToggle && liveChatWidget) {
        let chatOpen = false;
        
        chatToggle.addEventListener('click', function() {
            chatOpen = !chatOpen;
            
            if (chatOpen) {
                // Create chat box if it doesn't exist
                if (!document.querySelector('.chat-box')) {
                    createChatBox();
                }
                liveChatWidget.classList.add('chat-open');
                
                // Remove notification badge
                const notification = chatToggle.querySelector('.chat-notification');
                if (notification) {
                    notification.style.display = 'none';
                }
            } else {
                liveChatWidget.classList.remove('chat-open');
            }
        });
    }
    
    function createChatBox() {
        const chatBox = document.createElement('div');
        chatBox.className = 'chat-box';
        chatBox.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-info">
                    <img src="images/chat-avatar.png" alt="Support">
                    <div>
                        <h4>Winzee Support</h4>
                        <span class="chat-status">Online</span>
                    </div>
                </div>
                <button class="chat-minimize" aria-label="Minimize chat">
                    <i class="fas fa-minus"></i>
                </button>
            </div>
            <div class="chat-messages">
                <div class="chat-message support">
                    <p>Hello! 👋 How can I help you today?</p>
                    <span class="message-time">${getCurrentTime()}</span>
                </div>
            </div>
            <form class="chat-input-form">
                <input type="text" placeholder="Type your message..." class="chat-input">
                <button type="submit" class="chat-send" aria-label="Send message">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </form>
        `;
        
        liveChatWidget.appendChild(chatBox);
        
        // Handle chat minimize
        chatBox.querySelector('.chat-minimize').addEventListener('click', function() {
            liveChatWidget.classList.remove('chat-open');
            chatOpen = false;
        });
        
        // Handle message sending
        const chatForm = chatBox.querySelector('.chat-input-form');
        const chatInput = chatBox.querySelector('.chat-input');
        const messagesContainer = chatBox.querySelector('.chat-messages');
        
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const message = chatInput.value.trim();
            if (message) {
                // Add user message
                addChatMessage(message, 'user', messagesContainer);
                
                // Clear input
                chatInput.value = '';
                
                // Simulate response after delay
                setTimeout(() => {
                    const response = generateChatResponse(message);
                    addChatMessage(response, 'support', messagesContainer);
                }, 1000);
            }
        });
    }
    
    function addChatMessage(message, sender, container) {
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}`;
        messageEl.innerHTML = `
            <p>${message}</p>
            <span class="message-time">${getCurrentTime()}</span>
        `;
        
        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
    }
    
    function generateChatResponse(userMessage) {
        // Simple response logic (in real app, this would connect to a chatbot API)
        const responses = {
            'shipping': 'We offer free shipping on orders over $50. Standard shipping takes 3-5 business days.',
            'return': 'We have a 30-day return policy. Items must be unused and in original packaging.',
            'product': 'Our products are eco-friendly, non-toxic, and safe for use around children and pets.',
            'order': 'You can track your order by logging into your account or using the tracking link in your email.',
            'default': 'Thank you for your message. Our support team will get back to you shortly. You can also email us at support@winzee.com'
        };
        
        const lowerMessage = userMessage.toLowerCase();
        
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        return responses.default;
    }
    
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
    // Lazy Loading Images
    // ======================
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-lazy]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.lazy;
                        img.removeAttribute('data-lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            lazyImages.forEach(img => {
                img.src = img.dataset.lazy;
                img.removeAttribute('data-lazy');
            });
        }
    }
    
    // ======================
    // Testimonials Slider
    // ======================
    function initTestimonialsSlider() {
        const testimonialSlider = document.querySelector('.testimonials-slider');
        
        if (testimonialSlider) {
            // Sample testimonial data
            const testimonials = [
                {
                    name: 'Sarah Johnson',
                    rating: 5,
                    text: 'Winzee products have transformed my cleaning routine. They smell amazing and actually work!',
                    image: 'images/testimonials/customer1.jpg'
                },
                {
                    name: 'Mike Chen',
                    rating: 5,
                    text: 'As a parent, I love that these cleaners are safe around my kids but still powerful enough to tackle tough messes.',
                    image: 'images/testimonials/customer2.jpg'
                },
                {
                    name: 'Emily Rodriguez',
                    rating: 5,
                    text: 'Finally, eco-friendly cleaners that don\'t compromise on effectiveness. Highly recommend!',
                    image: 'images/testimonials/customer3.jpg'
                }
            ];
            
            // Create testimonial cards
            testimonials.forEach(testimonial => {
                const card = document.createElement('div');
                card.className = 'testimonial-card';
                card.innerHTML = `
                    <div class="testimonial-rating">${generateStarRating(testimonial.rating)}</div>
                    <p class="testimonial-text">"${testimonial.text}"</p>
                    <div class="testimonial-author">
                        <img src="${testimonial.image}" alt="${testimonial.name}">
                        <span>${testimonial.name}</span>
                    </div>
                `;
                testimonialSlider.appendChild(card);
            });
            
            // Initialize slider functionality
            let currentTestimonial = 0;
            const testimonialCards = testimonialSlider.querySelectorAll('.testimonial-card');
            
            // Show first testimonial
            if (testimonialCards.length > 0) {
                testimonialCards[0].classList.add('active');
                
                // Auto-rotate testimonials
                setInterval(() => {
                    testimonialCards[currentTestimonial].classList.remove('active');
                    currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
                    testimonialCards[currentTestimonial].classList.add('active');
                }, 4000);
            }
        }
    }
    
    // ======================
    // Form Validation
    // ======================
    function initFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                if (!validateForm(this)) {
                    e.preventDefault();
                }
            });
            
            // Real-time validation
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    validateInput(this);
                });
            });
        });
    }
    
    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        
        // Remove previous error
        input.classList.remove('error');
        const errorMsg = input.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
        
        // Check if empty
        if (!value) {
            showInputError(input, 'This field is required');
            isValid = false;
        } else if (input.type === 'email' && !isValidEmail(value)) {
            showInputError(input, 'Please enter a valid email address');
            isValid = false;
        }
        
        return isValid;
    }
    
    function showInputError(input, message) {
        input.classList.add('error');
        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        input.parentElement.appendChild(errorEl);
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // ======================
    // Initialize Analytics
    // ======================
    function initializeAnalytics() {
        // Google Analytics or other analytics code would go here
        console.log('Analytics initialized');
    }
    
    // ======================
    // Initialize Everything
    // ======================
    function init() {
        // Load featured products
        loadFeaturedProducts();
        
        // Initialize cart count
        updateCartCount();
        
        // Initialize lazy loading
        initLazyLoading();
        
        // Initialize testimonials slider
        initTestimonialsSlider();
        
        // Initialize form validation
        initFormValidation();
        
        // Check for analytics consent
        if (localStorage.getItem('cookiesAccepted')) {
            initializeAnalytics();
        }
    }
    
    // Start initialization
    init();
});

// ======================
// Utility Functions
// ======================

// Debounce function for performance
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

// Throttle function for scroll events
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
