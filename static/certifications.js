// Certifications Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations
    initScrollAnimations();
    initTypingAnimation();
    initCertificationCards();
    initTimelineAnimations();
    initCertificateGallery();
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Typing Animation for Main Title
function initTypingAnimation() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;
    
    const text = 'Our Certifications & Awards';
    const speed = 100; // typing speed in milliseconds
    
    // Clear the existing text
    typingElement.textContent = '';
    typingElement.style.borderRight = '3px solid #fff';
    
    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            typingElement.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        } else {
            // Keep blinking cursor for a few seconds after typing
            setTimeout(() => {
                typingElement.style.borderRight = 'none';
            }, 2000);
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeWriter, 500);
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all elements with fade-in-on-scroll class
    const animateElements = document.querySelectorAll('.fade-in-on-scroll');
    animateElements.forEach(el => observer.observe(el));
}

// Certification Cards Animation
function initCertificationCards() {
    const cards = document.querySelectorAll('.cert-card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, delay);
                cardObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });
    
    cards.forEach(card => {
        cardObserver.observe(card);
        
        // Add hover effect for feature tags
        const featureTags = card.querySelectorAll('.feature-tag');
        featureTags.forEach((tag, index) => {
            tag.addEventListener('mouseenter', () => {
                tag.style.animationDelay = `${index * 0.1}s`;
                tag.style.animation = 'pulse 0.6s ease';
            });
            
            tag.addEventListener('animationend', () => {
                tag.style.animation = '';
            });
        });
    });
}

// Timeline Animation
function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                    
                    // Animate the timeline marker with a bounce effect
                    const marker = entry.target.querySelector('.timeline-marker');
                    if (marker) {
                        setTimeout(() => {
                            marker.style.animation = 'markerBounce 0.6s ease';
                        }, 300);
                    }
                }, delay);
                timelineObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });
    
    timelineItems.forEach(item => {
        timelineObserver.observe(item);
        
        // Add interactive hover effects
        item.addEventListener('mouseenter', () => {
            const content = item.querySelector('.timeline-content');
            const marker = item.querySelector('.timeline-marker');
            
            content.style.transform = 'translateX(12px) scale(1.02)';
            marker.style.transform = 'scale(1.3)';
        });
        
        item.addEventListener('mouseleave', () => {
            const content = item.querySelector('.timeline-content');
            const marker = item.querySelector('.timeline-marker');
            
            content.style.transform = 'translateX(8px) scale(1)';
            marker.style.transform = 'scale(1.2)';
        });
    });
}

// Add CSS animations dynamically
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes markerBounce {
            0% { transform: scale(1.2); }
            50% { transform: scale(1.4); }
            100% { transform: scale(1.2); }
        }
        
        .cert-card:hover .cert-badge {
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: 200px 0; }
        }
        
        .cert-badge {
            background-image: linear-gradient(135deg, #1a1a4f, #2a2a8a, #1a1a4f);
            background-size: 200px 100%;
            background-repeat: no-repeat;
        }
        
        .timeline-content::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 49%, rgba(26, 26, 79, 0.02) 50%, transparent 51%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
        
        .timeline-item:hover .timeline-content::after {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

// Certificate Gallery Lightbox
function initCertificateGallery() {
    const modal = document.getElementById("lightbox-modal");
    if (!modal) return;

    const modalImg = document.getElementById("lightbox-img");
    const captionText = document.getElementById("lightbox-caption");
    const galleryItems = document.querySelectorAll('.gallery-item');
    const closeBtn = document.querySelector(".lightbox-close");

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('.gallery-image');
            modal.style.display = "block";
            modalImg.src = img.src;
            captionText.innerHTML = img.alt;
        });
    });

    function closeModal() {
        modal.style.display = "none";
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Initialize dynamic styles
addDynamicStyles();

// Add scroll progress indicator for certifications section
function initScrollProgress() {
    const certificationsSection = document.getElementById('certifications');
    if (!certificationsSection) return;
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        background: linear-gradient(135deg, #1a1a4f, #2a2a8a);
        z-index: 9999;
        transform-origin: left;
        transform: scaleX(0);
        transition: transform 0.3s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const sectionTop = certificationsSection.offsetTop;
        const sectionHeight = certificationsSection.offsetHeight;
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        if (scrollTop >= sectionTop - windowHeight && scrollTop <= sectionTop + sectionHeight) {
            const progress = Math.min(1, Math.max(0, (scrollTop - sectionTop + windowHeight) / (sectionHeight + windowHeight)));
            progressBar.style.transform = `scaleX(${progress})`;
            progressBar.style.width = '100%';
        } else {
            progressBar.style.transform = 'scaleX(0)';
        }
    });
}

// Initialize scroll progress
initScrollProgress();

// Add parallax effect to hero section
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    });
}

// Initialize parallax effect
initParallaxEffect();

// Add loading animation for the entire page
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});