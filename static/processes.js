// Processes JavaScript


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

// Process data with detailed information

    // 1. Grab the button and the target element
    const btn     = document.getElementById('scrollBtn');
    const target  = document.getElementById('processes');

    // 2. Attach a click listener
    btn.addEventListener('click', () => {
      // Scroll so that the target is at the top of the viewport
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
const processData = {
    'tooling': {
        title: 'Tooling Process',
        icon: '🔧',
        description: 'Our tooling department is the backbone of our manufacturing capabilities, creating precision dies, jigs, fixtures, and molds that enable efficient production of high-quality components.',
        detailedDescription: `
            <h3>What is Tooling?</h3>
            <p>Tooling is the process of creating specialized tools, dies, jigs, and fixtures that are essential for manufacturing operations. Our tooling department combines traditional craftsmanship with modern CNC technology to produce precision tooling solutions.</p>
            
            <h3>Our Tooling Capabilities</h3>
            <ul>
                <li><strong>Die Making:</strong> Progressive dies, compound dies, and transfer dies for sheet metal operations</li>
                <li><strong>Jigs & Fixtures:</strong> Custom holding devices for machining and assembly operations</li>
                <li><strong>Mold Making:</strong> Precision molds for various manufacturing processes</li>
                <li><strong>Gauge Making:</strong> Quality control gauges and inspection fixtures</li>
            </ul>
        `,
        machines: [
            {
                name: 'CNC Milling Machine',
                description: 'High-precision 3-axis and 5-axis CNC milling centers for complex geometries',
                capacity: 'Up to 1200mm x 800mm x 600mm',
                accuracy: '±0.01mm',
                homepage: '/machines/cnc-milling'
            },
            {
                name: 'CNC Lathe',
                description: 'Computer-controlled lathes for cylindrical components and tooling',
                capacity: 'Ø500mm x 1000mm',
                accuracy: '±0.005mm',
                homepage: '/machines/cnc-lathe'
            },
            {
                name: 'EDM Machine',
                description: 'Electrical Discharge Machining for complex cavities and hard materials',
                capacity: '400mm x 300mm x 300mm',
                accuracy: '±0.002mm',
                homepage: '/machines/edm'
            },
            {
                name: 'Surface Grinder',
                description: 'Precision grinding for flat surfaces and tight tolerances',
                capacity: '600mm x 200mm',
                accuracy: '±0.001mm',
                homepage: '/machines/surface-grinder'
            }
        ],
        products: [
            { name: 'Progressive Dies', description: 'Multi-stage stamping dies for automotive components', link: '/products/progressive-dies' },
            { name: 'Compound Dies', description: 'Single-stage dies for complex sheet metal parts', link: '/products/compound-dies' },
            { name: 'Machining Fixtures', description: 'Custom fixtures for CNC machining operations', link: '/products/machining-fixtures' },
            { name: 'Assembly Jigs', description: 'Precision jigs for component assembly', link: '/products/assembly-jigs' },
            { name: 'Quality Gauges', description: 'Custom inspection and measurement tools', link: '/products/quality-gauges' }
        ]
    },
    'machining': {
        title: 'Machining Process',
        icon: '⚙️',
        description: 'Our machining division specializes in precision turning, milling, and drilling operations, producing high-quality components for automotive, agricultural, and industrial applications.',
        detailedDescription: `
            <h3>What is Machining?</h3>
            <p>Machining is a subtractive manufacturing process that removes material from a workpiece to create desired shapes and dimensions. Our machining capabilities include turning, milling, drilling, and grinding operations.</p>
            
            <h3>Our Machining Capabilities</h3>
            <ul>
                <li><strong>CNC Turning:</strong> Precision cylindrical components with tight tolerances</li>
                <li><strong>CNC Milling:</strong> Complex 3D geometries and surface finishes</li>
                <li><strong>Drilling & Boring:</strong> Accurate hole making and internal features</li>
                <li><strong>Threading:</strong> Internal and external thread cutting</li>
            </ul>
        `,
        machines: [
            {
                name: 'CNC Turning Center',
                description: 'Advanced turning centers with live tooling capabilities',
                capacity: 'Ø320mm x 600mm',
                accuracy: '±0.01mm',
                homepage: '/machines/cnc-turning-center'
            },
            {
                name: 'VMC Machine',
                description: 'Vertical Machining Centers for complex milling operations',
                capacity: '1000mm x 500mm x 500mm',
                accuracy: '±0.005mm',
                homepage: '/machines/vmc'
            },
            {
                name: 'Conventional Lathe',
                description: 'Manual lathes for prototype and small batch production',
                capacity: 'Ø400mm x 1500mm',
                accuracy: '±0.05mm',
                homepage: '/machines/conventional-lathe'
            },
            {
                name: 'Drilling Machine',
                description: 'Radial and pillar drilling machines for hole making',
                capacity: 'Ø25mm max',
                accuracy: '±0.02mm',
                homepage: '/machines/drilling-machine'
            }
        ],
        products: [
            { name: 'Shaft Components', description: 'Precision shafts for automotive and industrial applications', link: '/products/shaft-components' },
            { name: 'Bushings', description: 'Steel and gun metal bushings for various machinery', link: '/products/bushings' },
            { name: 'Flanges', description: 'Machined flanges for piping and mechanical systems', link: '/products/flanges' },
            { name: 'Brackets', description: 'Precision machined brackets and mounting hardware', link: '/products/brackets' },
            { name: 'Custom Components', description: 'Tailored machined parts as per customer specifications', link: '/products/custom-components' }
        ]
    },
    'press': {
        title: 'Press Operations',
        icon: '🏭',
        description: 'Our press shop is equipped with various capacity presses for stamping, forming, and deep drawing operations, handling both high-volume production and prototype development.',
        detailedDescription: `
            <h3>What are Press Operations?</h3>
            <p>Press operations involve the use of mechanical or hydraulic presses to shape metal sheets and plates through various forming processes. Our press shop handles everything from simple blanking to complex deep drawing operations.</p>
            
            <h3>Our Press Capabilities</h3>
            <ul>
                <li><strong>Stamping:</strong> High-volume production of sheet metal components</li>
                <li><strong>Deep Drawing:</strong> Complex cup-shaped and cylindrical parts</li>
                <li><strong>Forming:</strong> Bending, flanging, and shaping operations</li>
                <li><strong>Blanking:</strong> Cutting operations for precise part geometry</li>
            </ul>
        `,
        machines: [
            {
                name: 'Hydraulic Press (400 Ton)',
                description: 'Heavy-duty hydraulic press for deep drawing and forming',
                capacity: '400 Ton pressing force',
                accuracy: '±0.1mm',
                homepage: '/machines/hydraulic-press-400'
            },
            {
                name: 'Hydraulic Press (200 Ton)',
                description: 'Medium capacity press for general stamping operations',
                capacity: '200 Ton pressing force',
                accuracy: '±0.1mm',
                homepage: '/machines/hydraulic-press-200'
            },
            {
                name: 'Mechanical Press',
                description: 'High-speed mechanical presses for production runs',
                capacity: '100 Ton pressing force',
                accuracy: '±0.05mm',
                homepage: '/machines/mechanical-press'
            },
            {
                name: 'Transfer Press',
                description: 'Automated transfer press for complex multi-stage operations',
                capacity: '150 Ton pressing force',
                accuracy: '±0.08mm',
                homepage: '/machines/transfer-press'
            }
        ],
        products: [
            { name: 'Automotive Stampings', description: 'Body panels and structural components for vehicles', link: '/products/automotive-stampings' },
            { name: 'Deep Drawn Components', description: 'Cup-shaped parts for various industrial applications', link: '/products/deep-drawn-components' },
            { name: 'Brackets & Mounts', description: 'Stamped brackets and mounting hardware', link: '/products/stamped-brackets' },
            { name: 'Electrical Enclosures', description: 'Sheet metal enclosures for electrical equipment', link: '/products/electrical-enclosures' },
            { name: 'Agricultural Parts', description: 'Stamped components for tractors and farm equipment', link: '/products/agricultural-parts' }
        ]
    },
    'sheet-metal': {
        title: 'Sheet Metal Fabrication',
        icon: '📋',
        description: 'Our sheet metal division offers comprehensive fabrication services including cutting, bending, welding, and assembly, working with various materials and thicknesses.',
        detailedDescription: `
            <h3>What is Sheet Metal Fabrication?</h3>
            <p>Sheet metal fabrication is a comprehensive manufacturing process that transforms flat metal sheets into finished products through cutting, bending, welding, and assembly operations. Our facility handles everything from simple brackets to complex assemblies.</p>
            
            <h3>Our Sheet Metal Capabilities</h3>
            <ul>
                <li><strong>Laser Cutting:</strong> Precision cutting with minimal heat affected zone</li>
                <li><strong>Bending:</strong> Accurate forming with consistent bend angles</li>
                <li><strong>Welding:</strong> TIG, MIG, and spot welding for strong joints</li>
                <li><strong>Assembly:</strong> Complete fabrication and sub-assembly services</li>
            </ul>
        `,
        machines: [
            {
                name: 'Laser Cutting Machine',
                description: 'CO2 laser cutting system for precision cutting of various materials',
                capacity: '2000mm x 1000mm, up to 20mm thickness',
                accuracy: '±0.1mm',
                homepage: '/machines/laser-cutting'
            },
            {
                name: 'Press Brake',
                description: 'CNC press brake for precise bending operations',
                capacity: '3000mm length, 100 Ton capacity',
                accuracy: '±0.5°',
                homepage: '/machines/press-brake'
            },
            {
                name: 'Shearing Machine',
                description: 'Guillotine shears for straight cutting operations',
                capacity: '3000mm x 6mm',
                accuracy: '±0.2mm',
                homepage: '/machines/shearing-machine'
            },
            {
                name: 'Welding Equipment',
                description: 'Complete welding setup including TIG, MIG, and spot welding',
                capacity: 'Up to 10mm thickness',
                accuracy: 'As per welding standards',
                homepage: '/machines/welding-equipment'
            }
        ],
        products: [
            { name: 'Enclosures & Cabinets', description: 'Metal enclosures for electrical and electronic equipment', link: '/products/enclosures' },
            { name: 'Structural Components', description: 'Fabricated structural parts for construction and machinery', link: '/products/structural-components' },
            { name: 'Tanks & Vessels', description: 'Custom tanks and pressure vessels for industrial use', link: '/products/tanks-vessels' },
            { name: 'Exhaust Systems', description: 'Fabricated exhaust components for automotive applications', link: '/products/exhaust-systems' },
            { name: 'Custom Assemblies', description: 'Complete fabricated assemblies as per customer requirements', link: '/products/custom-assemblies' }
        ]
    },
    'welding': {
        title: 'Welding',
        icon: '🔥',
        description: 'Our Welding joins two or more metal pieces by melting them together, creating a strong, fused bond.',
        detailedDescription: `
            <h3>What is Welding?</h3>
            <p>Welding is a fabrication process that joins materials, usually metals or thermoplastics, by using high heat to melt the parts together and allowing them to cool, causing fusion. Our certified welders are skilled in various techniques to ensure strong and durable joints.</p>
            
            <h3>Our Welding Capabilities</h3>
            <ul>
                <li><strong>MIG (Gas Metal Arc Welding):</strong> Ideal for a wide range of materials and thicknesses.</li>
                <li><strong>SMAW (Shielded Metal Arc Welding):</strong> Versatile and suitable for outdoor and on-site repairs.</li>
                <li><strong>Spot Welding:</strong> Efficient for joining overlapping sheets of metal.</li>
                <li><strong>Projection Welding:</strong> A modification of spot welding for creating strong, localized welds.</li>
            </ul>
        `,
        machines: [
            {
                name: 'MIG Welding Machine',
                description: 'High-performance MIG welders for fast and efficient fabrication.',
                capacity: 'Up to 20mm steel',
                accuracy: 'As per WPS',
                homepage: '/machines/mig-welding'
            },
            {
                name: 'SMAW Welding Machine',
                description: 'Portable and robust stick welders for various applications.',
                capacity: 'Various electrode sizes',
                accuracy: 'Dependent on operator skill',
                homepage: '/machines/smaw-welding'
            },
            {
                name: 'Spot Welder',
                description: 'Resistance spot welders for high-volume sheet metal assembly.',
                capacity: 'Up to 3mm + 3mm steel sheets',
                accuracy: 'Consistent weld nuggets',
                homepage: '/machines/spot-welder'
            },
            {
                name: 'Projection Welder',
                description: 'Specialized welders for attaching fasteners and other components.',
                capacity: 'Up to 50 kVA',
                accuracy: 'High precision',
                homepage: '/machines/projection-welder'
            }
        ],
        products: [
            { name: 'Chassis Components', description: 'Welded frames and sub-assemblies for vehicles.', link: '/products/chassis-components' },
            { name: 'Brackets and Mounts', description: 'Strong, welded brackets for industrial machinery.', link: '/products/welded-brackets' },
            { name: 'Custom Fabrications', description: 'Bespoke welded structures according to client designs.', link: '/products/custom-fabrications' },
            { name: 'Exhaust Assemblies', description: 'Durable welded exhaust systems.', link: '/products/exhaust-assemblies' }
        ]
    }
};

// DOM elements
const modal = document.getElementById('processModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupEventListeners();
    setupMobileMenu();
    initHeroTypewriter();
    initStatsCounter();
});

function animateNumber(element) {
    const text = element.textContent;
    const number = parseInt(text.replace(/\D/g, ''));
    if (isNaN(number)) return;
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

// Typewriter effect for hero title
function initHeroTypewriter() {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        // Add a blinking cursor
        heroTitle.innerHTML = '<span class="typing-cursor">|</span>';
        
        let i = 0;
        const typeSpeed = 120; // Adjust speed as needed
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor">|</span>';
                i++;
                setTimeout(typeWriter, typeSpeed);
            } else {
                // Remove cursor after typing is complete
                setTimeout(() => {
                    heroTitle.innerHTML = text;
                }, 1000);
            }
        }
        
        setTimeout(typeWriter, 500); // Start after a short delay
    }
}

// Animate stats counter
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-item .stat-number');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => observer.observe(stat));
}

// Initialize animations
function initializeAnimations() {
    // Animate process cards on scroll
    const processCards = document.querySelectorAll('.process-card');
    const statItems = document.querySelectorAll('.stat-item');
    const qualityItems = document.querySelectorAll('.quality-item');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Apply animation styles and observe elements
    [...processCards, ...statItems, ...qualityItems].forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
    
    // Stagger animations for process cards
    processCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.2}s`;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Close modal with close button
    closeBtn.onclick = closeModal;
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navUl = document.querySelector('nav ul');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            navUl.classList.toggle('show');
            this.classList.toggle('active');
        });
    }
}

// Open process detail modal
function openProcessDetail(processType) {
    const process = processData[processType];
    if (!process) return;
    
    const content = `
        <div class="process-detail">
            <div class="process-header">
                    <span class="process-icon-large">${process.icon}</span>
                    <h2>${process.title}</h2>
                    <p>${process.description}</p>
                </div>
            </div>
            
            <div class="process-body">
                <div class="process-description">
                    ${process.detailedDescription}
                </div>
                
                <div class="machines-section">
                    <h3>Available Machines</h3>
                    <div class="machines-grid">
                        ${process.machines.map(machine => `
                            <div class="machine-card">
                                <h4>${machine.name}</h4>
                                <p>${machine.description}</p>
                                <div class="machine-specs">
                                    <div class="spec-item">
                                        <strong>Capacity:</strong> ${machine.capacity}
                                    </div>
                                    <div class="spec-item">
                                        <strong>Accuracy:</strong> ${machine.accuracy}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="products-section">
                    <h3>Products Made Using This Process</h3>
                    <div class="products-grid">
                        ${process.products.map(product => `
                            <div class="product-card">
                                <h4>${product.name}</h4>
                                <p>${product.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modalContent.innerHTML = content;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Add animation to modal content
    setTimeout(() => {
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
    }, 10);
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(-20px)';
}

// Add CSS for modal content
const modalStyles = `
<style>
.process-detail {
    padding: 2rem;
}

.process-header {
    text-align: center;
    padding: 2rem;
    border-radius: 15px;
    margin-bottom: 2rem;
}

.process-icon-large {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
}

.process-header h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.process-header p {
    font-size: 1.1rem;
    opacity: 0.9;
}

.process-body {
    padding: 0 1rem;
}

.process-description {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 2rem;
}

.process-description h3 {
    color: rgb(23, 23, 79);
    margin-bottom: 1rem;
}

.process-description ul {
    padding-left: 1.5rem;
}

.process-description li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

.machines-section, .products-section {
    margin-bottom: 2rem;
}

.machines-section h3, .products-section h3 {
    color: rgb(23, 23, 79);
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid rgb(23, 23, 79);
}

.machines-grid, .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.machine-card, .product-card {
    background: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.machine-card:hover, .product-card:hover {
    transform: translateY(-5px);
}

.machine-card h4, .product-card h4 {
    color: rgb(23, 23, 79);
    margin-bottom: 0.5rem;
}

.machine-specs {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 5px;
}

.spec-item {
    margin-bottom: 0.5rem;
}

.spec-item strong {
    color: rgb(23, 23, 79);
}

.btn-machine, .btn-product {
    background: rgb(23, 23, 79);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 25px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
    width: 100%;
    margin-top: 1rem;
}

.btn-machine:hover, .btn-product:hover {
    background: #495057;
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .process-detail {
        padding: 1rem;
    }
    
    .process-header {
        padding: 1.5rem;
    }
    
    .process-header h2 {
        font-size: 2rem;
    }
    
    .machines-grid, .products-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Add modal styles to document head
document.head.insertAdjacentHTML('beforeend', modalStyles);