// customers.js - Interactive Customer Page Enhancement

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initParallaxEffect();
    initCustomerCardAnimations();
    initStatsCounter();
    initFloatingParticles();
    initScrollAnimations();
    initCustomerCardInteractions();
    initHeroTextEffects();
    initCustomerGridSorting();
    initThemeToggle();
    initLoadingAnimations();
});

// 1. Parallax Effect for Hero Section
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    });
}

// 2. Enhanced Customer Card Animations
function initCustomerCardAnimations() {
    const cards = document.querySelectorAll('.customer-card');
    
    cards.forEach((card, index) => {
        // Staggered entrance animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);

        // Enhanced hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(26, 26, 79, 0.3)';
            
            // Add ripple effect
            createRippleEffect(card);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
        });

        // Click effect
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// 3. Animated Stats Counter
function initStatsCounter() {
    const statCards = document.querySelectorAll('.stat-card h3');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
            }
        });
    });

    statCards.forEach(card => observer.observe(card));
}

function animateNumber(element) {
    const text = element.textContent;
    const number = parseInt(text.replace(/\D/g, ''));
    const suffix = text.replace(/[\d.]/g, '');
    const duration = 2000;
    const increment = number / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

// 4. Floating Particles Background
function initFloatingParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            animation: float ${Math.random() * 6 + 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 4}s;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        particlesContainer.appendChild(particle);
    }

    hero.appendChild(particlesContainer);

    // Add CSS animation for particles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
    `;
    document.head.appendChild(style);
}

// 5. Scroll-triggered Animations
function initScrollAnimations() {
    const sections = document.querySelectorAll('.customers-section, .stats-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.8s ease forwards';
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        observer.observe(section);
    });

    // Add slide-in animation
    const slideStyle = document.createElement('style');
    slideStyle.textContent = `
        @keyframes slideInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(slideStyle);
}

// 6. Interactive Customer Card Details
function initCustomerCardInteractions() {
    const cards = document.querySelectorAll('.customer-card');
    
    cards.forEach(card => {
        const overlay = card.querySelector('.customer-overlay');
        const info = card.querySelector('.customer-info');
        
        if (overlay && info) {
            // Add click to expand functionality
            card.addEventListener('click', () => {
                toggleCardExpansion(card);
            });

            // Add more interactive content
            const additionalInfo = document.createElement('div');
            additionalInfo.className = 'additional-info';
            additionalInfo.style.cssText = `
                margin-top: 1rem;
                opacity: 0;
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s ease;
            `;
            additionalInfo.innerHTML = `
                <div style="font-size: 0.8rem; line-height: 1.4;">
                    <p>Partnership since 2020</p>
                    <p>★★★★★ 5.0 Rating</p>
                </div>
            `;
            info.appendChild(additionalInfo);
        }
    });
}

// 7. Hero Text Effects
function initHeroTextEffects() {
    const heroTitle = document.querySelector('.hero h1');
    const heroSubtitle = document.querySelector('.hero p');
    
    if (heroTitle) {
        // Add typewriter effect
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '2px solid #fff';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                heroTitle.style.borderRight = 'none';
            }
        };
        
        setTimeout(typeWriter, 1000);
    }

    if (heroSubtitle) {
        // Add text glow effect
        heroSubtitle.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
    }
}

// 8. Customer Grid Sorting/Filtering
function initCustomerGridSorting() {
    const customersSection = document.querySelector('.customers-section .container');
    if (!customersSection) return;

    const filterButtons = document.createElement('div');
    filterButtons.className = 'filter-buttons';
    filterButtons.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    `;

    const categories = [
        { name: 'Cars', class: 'cars' },
        { name: 'Agri Machinery', class: 'agri' }, 
        { name: 'Defence', class: 'defence' },
        { name: 'Commercial Vehicles', class: 'commercial' },
        { name: 'Electrical', class: 'electrical' },
        { name: 'Earthmovers', class: 'earthmovers' },
        { name: 'EVs', class: 'ev'}
    ];

    categories.forEach(category => {
        const label = document.createElement('label');
        label.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            padding: 0.5rem 1rem;
            border: 2px solid #1a1a4f;
            border-radius: 25px;
            transition: all 0.3s ease;
        `;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = category.class;
        checkbox.addEventListener('change', handleMultiFilter);
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(category.name));
        filterButtons.appendChild(label);
    });

    customersSection.insertBefore(filterButtons, customersSection.querySelector('.customers-grid'));
}

function handleMultiFilter() {
    const checkboxes = document.querySelectorAll('.filter-buttons input[type="checkbox"]');
    const selectedFilters = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    const cards = document.querySelectorAll('.customer-card');
    
    cards.forEach(card => {
        const shouldShow = selectedFilters.length === 0 || 
            selectedFilters.some(filter => card.classList.contains(filter));
        
        card.style.display = shouldShow ? 'block' : 'none';
        card.style.opacity = shouldShow ? '1' : '0';
    });
}

function filterCustomers(category, activeButton) {
    const cards = document.querySelectorAll('.customer-card');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // Update button states
    buttons.forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.color = '#1a1a4f';
    });
    activeButton.style.background = '#1a1a4f';
    activeButton.style.color = 'white';

    // Filter cards with animation
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0.3';
            
            setTimeout(() => {
                card.style.transform = 'scale(1)';
                card.style.opacity = '1';
            }, 200);
        }, index * 50);
    });
}



// 10. Loading Animations
function initLoadingAnimations() {
    // Add pulse animation to cards while loading
    const cards = document.querySelectorAll('.customer-card');
    cards.forEach(card => {
        card.style.animation = 'pulse 2s infinite';
    });

    // Remove pulse after content loads
    window.addEventListener('load', () => {
        cards.forEach(card => {
            card.style.animation = 'none';
        });
    });

    // Add pulse animation CSS
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(pulseStyle);
}

// Utility Functions
function createRippleEffect(element) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: rippleEffect 0.6s linear;
        pointer-events: none;
    `;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';

    element.style.position = 'relative';
    element.appendChild(ripple);

    // Add ripple animation CSS
    if (!document.querySelector('#ripple-style')) {
        const rippleStyle = document.createElement('style');
        rippleStyle.id = 'ripple-style';
        rippleStyle.textContent = `
            @keyframes rippleEffect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(rippleStyle);
    }

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function toggleCardExpansion(card) {
    const additionalInfo = card.querySelector('.additional-info');
    if (additionalInfo) {
        const isExpanded = additionalInfo.style.maxHeight !== '0px';
        
        if (isExpanded) {
            additionalInfo.style.maxHeight = '0px';
            additionalInfo.style.opacity = '0';
        } else {
            additionalInfo.style.maxHeight = '100px';
            additionalInfo.style.opacity = '1';
        }
    }
}

// Easter Eggs and Fun Features
document.addEventListener('keydown', (e) => {
    // Konami Code Easter Egg
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    window.konamiIndex = window.konamiIndex || 0;
    
    if (e.code === konamiCode[window.konamiIndex]) {
        window.konamiIndex++;
        if (window.konamiIndex === konamiCode.length) {
            activatePartyMode();
            window.konamiIndex = 0;
        }
    } else {
        window.konamiIndex = 0;
    }
});

function activatePartyMode() {
    const cards = document.querySelectorAll('.customer-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'rainbow 2s infinite, bounce 1s infinite';
        }, index * 100);
    });

    // Add party mode CSS
    const partyStyle = document.createElement('style');
    partyStyle.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-30px); }
            60% { transform: translateY(-15px); }
        }
    `;
    document.head.appendChild(partyStyle);

    // Show party message
    const partyMessage = document.createElement('div');
    partyMessage.innerHTML = '🎉 PARTY MODE ACTIVATED! 🎉';
    partyMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24);
        color: white;
        padding: 2rem;
        border-radius: 20px;
        font-size: 2rem;
        font-weight: bold;
        z-index: 10000;
        animation: partyBounce 2s ease-in-out;
    `;
    document.body.appendChild(partyMessage);

    setTimeout(() => {
        partyMessage.remove();
        cards.forEach(card => {
            card.style.animation = 'none';
        });
    }, 5000);
}

// Performance Optimization
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

// Optimize scroll events
window.addEventListener('scroll', debounce(() => {
    // Scroll-dependent animations go here
}, 16));

// Add this new function
function assignFilterClasses() {
    const cards = document.querySelectorAll('.customer-card');
    const filterMapping = {
        'Maruti Suzuki': ['cars'],
        'Volvo Eicher': ['commercial'],
        'Havells': ['electrical'],
        'Kobelco': ['earthmovers'],
        'Carraro': ['cars'],
        'New Holland': ['agri'],
        'Escorts Kubota': ['agri'],
        'Mahindra Defence': ['defence'],
        'Caparo Maruti': ['cars'],
        'Euler Motors': ['ev'],
        'Delton Cables': ['electrical']

    };

    cards.forEach(card => {
        const companyName = card.querySelector('.customer-info h3').textContent;
        const classes = filterMapping[companyName] || [];
        classes.forEach(cls => card.classList.add(cls));
    });
}

// Add this call to your DOMContentLoaded event listener (at the top)
document.addEventListener('DOMContentLoaded', function() {
    assignFilterClasses(); // Add this line
    initParallaxEffect();
    // ... rest of your existing init calls
});
