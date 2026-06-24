// Typing Animation Class
class TypingAnimation {
    constructor(element, text, speed = 50) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.index = 0;
    }

    async start() {
        this.element.textContent = '';
        
        // Add cursor
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.style.cssText = `
            display: inline-block;
            width: 2px;
            height: 1em;
            background: #667eea;
            animation: blink 1s infinite;
        `;
        this.element.appendChild(cursor);

        return new Promise(resolve => {
            const typeInterval = setInterval(() => {
                if (this.index < this.text.length) {
                    cursor.before(this.text.charAt(this.index));
                    this.index++;
                } else {
                    // Remove cursor after typing is complete
                    cursor.remove();
                    clearInterval(typeInterval);
                    resolve();
                }
            }, this.speed);
        });
    }
}

// Global Typing Animation Manager
class GlobalTypingManager {
    constructor() {
        this.init();
    }

    async init() {
        // Add cursor blinking animation to document
        this.addCursorAnimation();
        
        // Animate global elements on page load
        await this.animateGlobalElements();
    }

    addCursorAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    async animateGlobalElements() {
        const globalElements = document.querySelectorAll('.typing-element-global');
        
        for (let element of globalElements) {
            const originalText = element.textContent;
            const animation = new TypingAnimation(element, originalText, 60);
            await animation.start();
            await new Promise(resolve => setTimeout(resolve, 500)); // Pause between elements
        }
    }
}

// Machine Card Manager
class MachineCardManager {
    constructor() {
        this.cards = document.querySelectorAll('.machine-card');
        this.searchInput = document.getElementById('machineSearch');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.expandedCard = null;
        this.init();
    }

    init() {
        this.setupCardEvents();
        this.setupFilterEvents();
        this.setupSearchEvents();
        this.addCardAnimations();
    }

    addCardAnimations() {
        // Add necessary CSS for card animations
        const style = document.createElement('style');
        style.textContent = `
            .machine-card {
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .machine-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            
            .machine-details {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.5s ease, padding 0.5s ease;
                opacity: 0;
            }
            
            .machine-card.expanded .machine-details {
                max-height: 500px;
                opacity: 1;
                padding: 20px;
            }
            
            .machine-details li {
                opacity: 0;
                transform: translateX(-20px);
                transition: all 0.3s ease;
            }
            
            .machine-card.expanded .machine-details li {
                opacity: 1;
                transform: translateX(0);
            }
        `;
        document.head.appendChild(style);
    }

    setupCardEvents() {
        this.cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (e.target.closest('button')) return;
                this.toggleCard(card);
            });
        });
    }

    async toggleCard(card) {
        // Close other expanded cards
        if (this.expandedCard && this.expandedCard !== card) {
            this.expandedCard.classList.remove('expanded');
        }

        const isExpanding = !card.classList.contains('expanded');
        card.classList.toggle('expanded');

        if (isExpanding) {
            this.expandedCard = card;
            await this.animateCardContent(card);
            // Smooth scroll to show the expanded content
            setTimeout(() => {
                card.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 300);
        } else {
            this.expandedCard = null;
        }
    }

    async animateCardContent(card) {
        const typingElements = card.querySelectorAll('.machine-details .typing-element');
        
        for (let element of typingElements) {
            const originalText = element.textContent;
            const animation = new TypingAnimation(element, originalText, 30);
            await animation.start();
            await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between elements
        }
    }

    setupFilterEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const category = button.dataset.category;
                this.filterCards(category);
            });
        });
    }

    setupSearchEvents() {
        if (!this.searchInput) return;
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchCards(e.target.value);
            }, 300);
        });
    }

    filterCards(category) {
        this.cards.forEach(card => {
            const cardCategory = card.dataset.category;
            const shouldShow = category === 'all' || cardCategory === category;
            
            if (shouldShow) {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    if (card.style.opacity === '0') {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });
    }

    searchCards(query) {
        const searchTerm = query.toLowerCase();
        
        this.cards.forEach(card => {
            const machineName = card.dataset.name.toLowerCase();
            const machineDescription = card.querySelector('.machine-description').textContent.toLowerCase();
            const machineCategory = card.querySelector('.machine-category').textContent.toLowerCase();
            
            const matches = machineName.includes(searchTerm) || 
                          machineDescription.includes(searchTerm) || 
                          machineCategory.includes(searchTerm);
            
            if (matches) {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    if (card.style.opacity === '0') {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });
    }
}

// Hero Slider Manager
class HeroSlider {
    constructor(selector, interval = 5000) {
        this.slider = document.querySelector(selector);
        if (!this.slider) return;

        this.slides = this.slider.querySelectorAll('.slide');
        this.interval = interval;
        this.currentSlide = 0;

        if (this.slides.length > 0) {
            this.init();
        }
    }

    init() {
        this.slides[this.currentSlide].classList.add('active');
        setInterval(() => this.nextSlide(), this.interval);
    }

    nextSlide() {
        this.slides[this.currentSlide].classList.remove('active');
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.slides[this.currentSlide].classList.add('active');
    }
}

// Apply a category filter coming from the URL (e.g. /machines?cat=presses)
// immediately on load so nav-dropdown links land pre-filtered, without
// waiting for the typing animation / card manager to initialise.
function applyMachineUrlFilter() {
    const cat = new URLSearchParams(window.location.search).get('cat');
    if (!cat) return;
    const buttons = document.querySelectorAll('.filter-btn');
    const match = [...buttons].find(b => b.dataset.category === cat);
    if (!match) return;
    buttons.forEach(b => b.classList.toggle('active', b === match));
    document.querySelectorAll('.machine-card').forEach(card => {
        card.style.display = (card.dataset.category === cat) ? 'block' : 'none';
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Pre-filter from the URL right away (before the 3s animation delay).
    applyMachineUrlFilter();

    // Initialize the hero slider
    new HeroSlider('.hero .slider');

    // Initialize global typing animations first
    const globalTypingManager = new GlobalTypingManager();
    
    // Wait a bit for global animations to complete, then initialize machine cards
    setTimeout(() => {
        new MachineCardManager();
    }, 3000); // Adjust timing as needed
});