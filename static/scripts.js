// Image slider functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const slider = document.querySelector('.slider');
    let currentSlide = 0;
    let slideInterval;
    
    // Create slider controls if they don't exist
    if (!document.querySelector('.slider-controls')) {
        const controls = document.createElement('div');
        controls.className = 'slider-controls';
        
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'slider-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            controls.appendChild(dot);
        });
        
        slider.appendChild(controls);
    }
    
    const dots = document.querySelectorAll('.slider-dot');
    
    // Initialize first slide
    if (slides.length > 0) {
        slides[0].classList.add('active');
    }
    
    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to current slide and dot
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function goToSlide(index) {
        currentSlide = index;
        showSlide(currentSlide);
        resetAutoSlide();
    }
    
    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }
    
    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }
    
    // Start auto-sliding
    if (slides.length > 1) {
        startAutoSlide();
    }
    
    // Pause auto-slide on hover
    slider.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    slider.addEventListener('mouseleave', () => {
        if (slides.length > 1) {
            startAutoSlide();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
            resetAutoSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoSlide();
        }
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    slider.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                nextSlide();
            } else {
                // Swipe right - previous slide
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(currentSlide);
            }
            resetAutoSlide();
        }
    }
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

// Fade in animation on scroll
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    const elementsToObserve = document.querySelectorAll('.card, .about-content, .section');
    elementsToObserve.forEach(el => {
        observer.observe(el);
    });
});

// Enhanced button interactions
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// CSS for ripple effect (will be added dynamically)
if (!document.querySelector('#ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Performance optimization: Preload next slide image
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide img');
    
    // Preload the next image
    function preloadNextImage(currentIndex) {
        const nextIndex = (currentIndex + 1) % slides.length;
        if (slides[nextIndex] && !slides[nextIndex].complete) {
            const img = new Image();
            img.src = slides[nextIndex].src;
        }
    }
    
    // Preload first few images
    slides.forEach((slide, index) => {
        if (index < 3) {
            const img = new Image();
            img.src = slide.src;
        }
    });
});

// Accessibility improvements
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    
    // Add ARIA labels
    if (slider) {
        slider.setAttribute('role', 'region');
        slider.setAttribute('aria-label', 'Image carousel');
    }
    
    slides.forEach((slide, index) => {
        slide.setAttribute('role', 'img');
        slide.setAttribute('aria-label', `Slide ${index + 1} of ${slides.length}`);
    });
    
    // Add keyboard focus management
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('tabindex', '0');
        
        dot.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dot.click();
            }
        });
    });
});