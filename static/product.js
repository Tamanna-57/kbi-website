// Product Template JavaScript
// This file handles loading and displaying product data

// Show/hide loading spinner
function showLoading() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
}

// Main function to load product data
async function loadProductData(productId) {
    showLoading();
    
    try {
        // Fetch product data from API
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const productData = await response.json();
        
        // Populate the page with product data
        populateProductDetails(productData);
        
    } catch (error) {
        console.error('Error loading product data:', error);
        showError('Failed to load product details. Please try again later.');
    } finally {
        hideLoading();
    }
}

// Populate product details on the page
function populateProductDetails(product) {
    // Update basic product info
    document.getElementById('product-name').textContent = product.name || 'Product Name';
    document.getElementById('product-description').textContent = product.description || 'No description available';
    document.getElementById('product-category').textContent = product.category || 'General';
    
    // Update product image
    const productImg = document.getElementById('product-img');
    if (product.image) {
        productImg.src = product.image;
        productImg.alt = product.name || 'Product Image';
    }
    
    // Populate applications
    populateApplications(product.applications || []);
    
    // Populate features
    populateFeatures(product.features || []);
    
    // Populate specifications
    populateSpecifications(product.specifications || {});
    
    // Populate manufacturing process
    populateManufacturingProcess(product.manufacturing_process || []);
    
    // Populate related machines
    populateRelatedMachines(product.related_machines || []);
    
    // Populate quality standards
    populateQualityStandards(product.quality_standards || []);
}

// Populate applications list
function populateApplications(applications) {
    const container = document.getElementById('applications');
    container.innerHTML = '';
    
    if (applications.length === 0) {
        container.innerHTML = '<p>No applications listed</p>';
        return;
    }
    
    applications.forEach(app => {
        const appDiv = document.createElement('div');
        appDiv.className = 'application-item';
        appDiv.innerHTML = `
            <h4>${app.title || 'Application'}</h4>
            <p>${app.description || 'No description available'}</p>
        `;
        container.appendChild(appDiv);
    });
}

// Populate features list
function populateFeatures(features) {
    const container = document.getElementById('features');
    container.innerHTML = '';
    
    if (features.length === 0) {
        container.innerHTML = '<p>No features listed</p>';
        return;
    }
    
    const featuresList = document.createElement('ul');
    featuresList.className = 'features-ul';
    
    features.forEach(feature => {
        const listItem = document.createElement('li');
        listItem.className = 'feature-item';
        listItem.innerHTML = `
            <strong>${feature.title || 'Feature'}:</strong> 
            ${feature.description || 'No description available'}
        `;
        featuresList.appendChild(listItem);
    });
    
    container.appendChild(featuresList);
}

// Populate specifications grid
function populateSpecifications(specifications) {
    const container = document.getElementById('specifications');
    container.innerHTML = '';
    
    if (Object.keys(specifications).length === 0) {
        container.innerHTML = '<p>No specifications available</p>';
        return;
    }
    
    Object.entries(specifications).forEach(([key, value]) => {
        const specDiv = document.createElement('div');
        specDiv.className = 'spec-item';
        specDiv.innerHTML = `
            <div class="spec-label">${formatSpecLabel(key)}</div>
            <div class="spec-value">${value}</div>
        `;
        container.appendChild(specDiv);
    });
}

// Populate manufacturing process
function populateManufacturingProcess(processSteps) {
    const container = document.getElementById('manufacturing-process');
    container.innerHTML = '';
    
    if (processSteps.length === 0) {
        container.innerHTML = '<p>No manufacturing process information available</p>';
        return;
    }
    
    processSteps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'process-step';
        stepDiv.innerHTML = `
            <div class="step-number">${index + 1}</div>
            <div class="step-content">
                <h4>${step.title || `Step ${index + 1}`}</h4>
                <p>${step.description || 'No description available'}</p>
            </div>
        `;
        container.appendChild(stepDiv);
    });
}

// Populate related machines
function populateRelatedMachines(machines) {
    const container = document.getElementById('related-machines');
    container.innerHTML = '';
    
    if (machines.length === 0) {
        container.innerHTML = '<p>No related machines listed</p>';
        return;
    }
    
    machines.forEach(machine => {
        const machineDiv = document.createElement('div');
        machineDiv.className = 'related-item';
        machineDiv.innerHTML = `
            <div class="related-image">
                <img src="${machine.image || '/static/images/default-machine.png'}" 
                     alt="${machine.name || 'Machine'}">
            </div>
            <div class="related-info">
                <h4>${machine.name || 'Machine Name'}</h4>
                <p>${machine.description || 'No description available'}</p>
                <a href="/machines/${machine.id}" class="view-details">View Details</a>
            </div>
        `;
        container.appendChild(machineDiv);
    });
}

// Populate quality standards
function populateQualityStandards(standards) {
    const container = document.getElementById('quality-standards');
    container.innerHTML = '';
    
    if (standards.length === 0) {
        container.innerHTML = '<p>No quality standards listed</p>';
        return;
    }
    
    standards.forEach(standard => {
        const standardDiv = document.createElement('div');
        standardDiv.className = 'quality-item';
        standardDiv.innerHTML = `
            <div class="quality-badge">
                <span class="standard-name">${standard.name || 'Standard'}</span>
                <span class="standard-level">${standard.level || 'Certified'}</span>
            </div>
            <p>${standard.description || 'Quality standard certification'}</p>
        `;
        container.appendChild(standardDiv);
    });
}

// Utility function to format specification labels
function formatSpecLabel(key) {
    return key.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Show error message
function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()">Retry</button>
        </div>
    `;
    container.appendChild(errorDiv);
}

// Initialize tooltips (if needed)
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = event.target.getAttribute('data-tooltip');
    document.body.appendChild(tooltip);
    
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Initialize page features
document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Export functions for external use
window.loadProductData = loadProductData;
window.populateProductDetails = populateProductDetails;