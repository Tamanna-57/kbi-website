document.addEventListener('DOMContentLoaded', function() {
    
    // Form Submission
document.querySelector('.contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submission initiated.');
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // Collect form data
    const formData = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        phone: form.phone.value,
        company: form.company.value,
        subject: form.subject.value,
        message: form.message.value
    };
    
    try {
        // Send data to Flask backend
        console.log('Form data:', formData);
        const response = await fetch('/submit-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Success - show success message and reset form
            alert(result.message);
            form.reset();
        } else {
            // Error from server
            alert(result.message || 'There was an error sending your message. Please try again.');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error sending your message. Please check your connection and try again.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});

// Optional: Add real-time form validation
document.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
    field.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#ddd';
        }
    });
});

// Email validation
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        this.style.borderColor = '#e74c3c';
        // You could show an error message here
    } else if (email) {
        this.style.borderColor = '#27ae60';
    }
});

    // Existing Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // FAQ Toggle Functionality
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const icon = question.querySelector('i');
            
            // Close other active items
            document.querySelectorAll('.faq-item.active').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = '0';
                    item.querySelector('i').style.transform = 'rotate(0deg)';
                }
            });

            faqItem.classList.toggle('active');
            
            if (faqItem.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            } else {
                answer.style.maxHeight = '0';
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });
});
