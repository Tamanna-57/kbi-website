document.addEventListener('DOMContentLoaded', function() {
    // Initialize all about us page features
    initTypewriterEffect();
    initTimelineAnimations();
    initTeamMemberInteractions();
    initStatCounters();
    initValueCardAnimations();
    initScrollProgressBar();
    initSectionTransitions();
    initHeroAnimations();
    initNavigationEnhancements();

    // Load main script functionality
    loadMainScriptFeatures();
});

// Typewriter effect for hero title
function initTypewriterEffect() {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        // Create blinking cursor animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            .typing-cursor {
                animation: blink 1s infinite;
            }
        `;
        document.head.appendChild(style);
        
        heroTitle.innerHTML = '<span class="typing-cursor">|</span>';
        
        let i = 0;
        const typeSpeed = 100;
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor">|</span>';
                i++;
                setTimeout(typeWriter, typeSpeed);
            } else {
                // Remove cursor after typing is complete and add fade out
                setTimeout(() => {
                    heroTitle.innerHTML = text;
                }, 1000);
            }
        }
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }
}

// Enhanced hero animations
function initHeroAnimations() {
    const heroContent = document.querySelector('.hero-content');
    const heroSubtitle = document.querySelector('.hero p');
    const heroButton = document.querySelector('.hero .btn');
    
    if (heroContent) {
        // Initial state
        if (heroSubtitle) {
            heroSubtitle.style.opacity = '0';
            heroSubtitle.style.transform = 'translateY(30px)';
        }
        
        if (heroButton) {
            heroButton.style.opacity = '0';
            heroButton.style.transform = 'translateY(30px)';
        }
        
        // Animate subtitle after title typing
        setTimeout(() => {
            if (heroSubtitle) {
                heroSubtitle.style.transition = 'all 0.8s ease';
                heroSubtitle.style.opacity = '1';
                heroSubtitle.style.transform = 'translateY(0)';
            }
        }, 2000);
        
        // Animate button after subtitle
        setTimeout(() => {
            if (heroButton) {
                heroButton.style.transition = 'all 0.8s ease';
                heroButton.style.opacity = '1';
                heroButton.style.transform = 'translateY(0)';
            }
        }, 2500);
    }
}

// Enhanced timeline animations
function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('timeline-animate');
                }, index * 200);
            }
        });
    }, {
        threshold: 0.3
    });
    
    timelineItems.forEach(item => {
        item.classList.add('timeline-item-initial');
        timelineObserver.observe(item);
    });
    
    // Add timeline line animation
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    timeline.classList.add('animate-line');
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(timeline);
    }
}

// Fixed team member interactions with proper bio functionality
function initTeamMemberInteractions() {
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach(member => {
        const memberImage = member.querySelector('.member-image');
        const memberBio = member.querySelector('.member-bio');
        
        // Add hover effects
        member.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
            this.style.transition = 'all 0.3s ease';
            
            if (memberImage) {
                memberImage.style.transform = 'scale(1.05)';
                memberImage.style.transition = 'all 0.3s ease';
            }
        });
        
        member.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
            
            if (memberImage) {
                memberImage.style.transform = 'scale(1)';
            }
        });
        
        // Fixed bio toggle functionality
        if (memberBio) {
            const fullText = memberBio.textContent.trim();
            const wordLimit = 30;
            const words = fullText.split(' ');
            
            if (words.length > wordLimit) {
                const shortText = words.slice(0, wordLimit).join(' ') + '...';
                
                // Create read more button
                const readMoreBtn = document.createElement('button');
                readMoreBtn.textContent = 'Read More';
                readMoreBtn.className = 'read-more-btn';
                readMoreBtn.style.cssText = `
                    background: linear-gradient(135deg, rgb(23, 23, 79), #495057);
                    border: none;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    border-radius: 25px;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    display: block;
                    width: 100%;
                    text-align: center;
                `;
                
                // Initially show short text
                memberBio.textContent = shortText;
                memberBio.style.lineHeight = '1.6';
                memberBio.style.marginBottom = '1rem';
                
                // Add button after bio
                memberBio.parentNode.appendChild(readMoreBtn);
                
                let isExpanded = false;
                
                readMoreBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (!isExpanded) {
                        memberBio.textContent = fullText;
                        readMoreBtn.textContent = 'Read Less';
                        memberBio.classList.add('bio-expanded');
                        readMoreBtn.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
                    } else {
                        memberBio.textContent = shortText;
                        readMoreBtn.textContent = 'Read More';
                        memberBio.classList.remove('bio-expanded');
                        readMoreBtn.style.background = 'linear-gradient(135deg, rgb(23, 23, 79), #495057)';
                    }
                    
                    isExpanded = !isExpanded;
                });
                
                // Add hover effects to button
                readMoreBtn.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                });
                
                readMoreBtn.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = 'none';
                });
            }
        }
    });
}

// Enhanced stat counters with better animation - Fixed to show actual numbers
function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                const target = entry.target;
                const originalText = target.getAttribute('data-original') || target.textContent;
                
                // Store original text if not already stored
                if (!target.getAttribute('data-original')) {
                    target.setAttribute('data-original', originalText);
                }
                
                const number = parseInt(originalText.replace(/\D/g, ''));
                const suffix = originalText.replace(/[\d]/g, '');
                
                // Mark as animated to prevent re-animation
                target.classList.add('animated');
                
                if (number > 0) {
                    animateCounter(target, number, suffix, 2000);
                } else {
                    target.textContent = originalText;
                }
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    });
    
    statNumbers.forEach(stat => {
        // Don't reset to 0, keep original values
        counterObserver.observe(stat);
    });
}

function animateCounter(element, target, suffix, duration) {
    const startTime = performance.now();
    const startValue = 0;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
        
        element.textContent = currentValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + suffix;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Enhanced value card animations
function initValueCardAnimations() {
    const valueCards = document.querySelectorAll('.value-card');
    
    const cardObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('value-card-animate');
                }, index * 150);
            }
        });
    }, {
        threshold: 0.3
    });
    
    valueCards.forEach(card => {
        card.classList.add('value-card-initial');
        cardObserver.observe(card);
        
        // Enhanced hover effects
        const icon = card.querySelector('.value-icon');
        if (icon) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
                this.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                icon.style.transform = 'scale(1.3) rotate(10deg)';
                icon.style.transition = 'all 0.3s ease';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
                icon.style.transform = 'scale(1) rotate(0deg)';
            });
        }
    });
}

// Enhanced scroll progress bar
function initScrollProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.classList.add('scroll-progress');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 4px;
        background: linear-gradient(90deg, rgb(23, 23, 79), #495057, #007bff);
        z-index: 1000;
        transition: width 0.1s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(progressBar);
    
    let ticking = false;
    
    function updateProgress() {
        const scrolled = window.pageYOffset;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = Math.min((scrolled / maxScroll) * 100, 100);
        
        progressBar.style.width = percentage + '%';
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateProgress);
            ticking = true;
        }
    });
}

// Enhanced section transitions
function initSectionTransitions() {
    const sections = document.querySelectorAll('section');
    
    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    sections.forEach(section => {
        section.classList.add('section-initial');
        sectionObserver.observe(section);
    });
}

// Navigation enhancements
function initNavigationEnhancements() {
    const navLinks = document.querySelectorAll('nav a');
    
    // Add active state for current page
    navLinks.forEach(link => {
        if (link.getAttribute('href') === '/about_us' || link.getAttribute('href') === '#') {
            link.classList.add('active');
        }
        
        // Add smooth hover effects
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'all 0.3s ease';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Load main script features
function loadMainScriptFeatures() {
    // Smooth scrolling for internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255,255,255,0.5);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add performance monitoring
window.addEventListener('load', function() {
    console.log('Enhanced About Us page loaded in:', (performance.now() / 1000).toFixed(2), 'seconds');
    
    // Add loading animation completion
    document.body.classList.add('page-loaded');
});

// Add scroll-to-top functionality
function addScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgb(23, 23, 79), #495057);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    scrollBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    scrollBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

// Initialize scroll to top
addScrollToTop();

console.log('Enhanced About Us JavaScript loaded successfully with all improvements!');