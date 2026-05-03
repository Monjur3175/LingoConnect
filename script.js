// LingoConnect - Interactive JavaScript

let lcCurrentUser = null;

async function lcCheckAuthStatus() {
    try {
        const response = await fetch('backend/api/check_auth.php', { method: 'GET' });
        const data = await response.json();

        if (data && data.success && data.authenticated) {
            lcCurrentUser = data.user;
        } else {
            lcCurrentUser = null;
        }

        lcUpdateNavbar();
    } catch (e) {
        lcCurrentUser = null;
    }
}

function lcUpdateNavbar() {
    const headerButtons = document.querySelector('.header-buttons');
    if (!headerButtons) return;

    if (lcCurrentUser) {
        headerButtons.innerHTML = `
            <span style="margin-right: 15px; color: #475569; font-size: 14px;">Welcome, ${lcCurrentUser.name}</span>
            <button type="button" class="btn btn-outline" id="lcLogoutBtn">Logout</button>
        `;

        const logoutBtn = document.getElementById('lcLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', lcLogout);
        }
    } else {
        headerButtons.innerHTML = `
            <a href="signup.html" class="btn btn-primary">Sign Up</a>
            <a href="login.html" class="btn btn-secondary">Login</a>
        `;
    }
}

async function lcHandleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value || '';

    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch('backend/api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data && data.success) {
            lcCurrentUser = data.user;
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        } else {
            showMessage(data?.message || 'Login failed', 'error');
        }
    } catch (e) {
        showMessage('Login failed', 'error');
    }
}

async function lcHandleSignup(event) {
    event.preventDefault();

    const fullname = document.getElementById('fullname')?.value?.trim() || '';
    const email = document.getElementById('email')?.value?.trim() || '';
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const language = document.getElementById('language')?.value || '';

    if (!fullname || !email || !password || !confirmPassword || !language) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch('backend/api/signup.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, email, password, confirmPassword, language })
        });

        const data = await response.json();
        if (data && data.success) {
            showMessage('Account created! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 900);
        } else {
            showMessage(data?.message || 'Signup failed', 'error');
        }
    } catch (e) {
        showMessage('Signup failed', 'error');
    }
}

async function lcLogout() {
    try {
        await fetch('backend/api/logout.php', { method: 'GET' });
    } catch (e) {
        // ignore
    }
    lcCurrentUser = null;
    lcUpdateNavbar();
    showMessage('Logged out', 'success');
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        ${type === 'error' ? 'background: #ef4444;' : 'background: #10b981;'}
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    lcCheckAuthStatus();
    // Mobile Navigation Toggle
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.innerHTML = '☰';
    mobileMenuToggle.style.cssText = 'display: none; background: none; border: none; font-size: 24px; color: #0f172a; cursor: pointer;';
    
    const headerContainer = document.querySelector('.header-container');
    if (headerContainer) {
        headerContainer.insertBefore(mobileMenuToggle, headerContainer.firstChild);
    }
    
    const nav = document.querySelector('.nav');
    
    // Toggle mobile menu
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function() {
            if (nav.style.display === 'flex') {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'flex';
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.right = '0';
                nav.style.background = 'white';
                nav.style.padding = '20px';
                nav.style.boxShadow = '0px 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }
        });
    }
    
    // Smooth scrolling for anchor links
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
    
    // Active navigation highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || (currentPath === '/' && linkPath === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Attach auth form handlers (do NOT let generic form handler intercept them)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', lcHandleLogin);
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', lcHandleSignup);
    }

    // Form validation and submission (non-auth forms only)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.id === 'loginForm' || form.id === 'signupForm') return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            const nameInput = form.querySelector('input[type="text"]');
            const messageInput = form.querySelector('textarea');

            if (emailInput && !emailInput.value.includes('@')) {
                showMessage('Please enter a valid email address', 'error');
                return;
            }

            if (nameInput && nameInput.value.trim().length < 2) {
                showMessage('Please enter your full name', 'error');
                return;
            }

            if (messageInput && messageInput.value.trim().length < 10) {
                showMessage('Please enter a message with at least 10 characters', 'error');
                return;
            }

            showMessage('Thank you for your message! We will get back to you soon.', 'success');
            form.reset();
        });
    });
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @media (max-width: 768px) {
            .header-buttons {
                display: none;
            }
            
            .nav {
                display: none;
            }
            
            button[style*="display: none"] {
                display: block !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Pricing toggle functionality
    const billingToggle = document.querySelector('input[type="checkbox"]');
    if (billingToggle) {
        billingToggle.addEventListener('change', function() {
            const prices = document.querySelectorAll('[style*="font-size: 48px"]');
            const isYearly = this.checked;
            
            prices.forEach(priceElement => {
                const currentPrice = parseInt(priceElement.textContent.replace('$', ''));
                const yearlyPrice = Math.floor(currentPrice * 12 * 0.8); // 20% discount
                const newPrice = isYearly ? yearlyPrice : currentPrice;
                const period = isYearly ? '/year' : '/month';
                
                priceElement.innerHTML = `$${newPrice}<span style="color: #64748b; font-size: 16px;">${period}</span>`;
            });
        });
    }
    
    // Course filter functionality
    const filterButtons = document.querySelectorAll('.btn');
    filterButtons.forEach(button => {
        if (button.textContent.includes('All') || 
            button.textContent.includes('Beginner') || 
            button.textContent.includes('Intermediate') || 
            button.textContent.includes('Advanced') ||
            button.textContent.includes('Business') ||
            button.textContent.includes('Test Prep')) {
            
            button.addEventListener('click', function() {
                // Remove active state from all filter buttons
                filterButtons.forEach(btn => {
                    if (btn.textContent.includes('All') || 
                        btn.textContent.includes('Beginner') || 
                        btn.textContent.includes('Intermediate') || 
                        btn.textContent.includes('Advanced') ||
                        btn.textContent.includes('Business') ||
                        btn.textContent.includes('Test Prep')) {
                        btn.classList.remove('btn-primary');
                        btn.classList.add('btn-outline');
                    }
                });
                
                // Add active state to clicked button
                this.classList.remove('btn-outline');
                this.classList.add('btn-primary');
                
                // Show message (in real app, this would filter the courses)
                const filterType = this.textContent;
                showMessage(`Showing ${filterType} courses`, 'success');
            });
        }
    });
    
    // Newsletter subscription
    const newsletterForms = document.querySelectorAll('input[type="email"]');
    newsletterForms.forEach(input => {
        const subscribeButton = input.nextElementSibling;
        if (subscribeButton && subscribeButton.textContent === 'Subscribe') {
            subscribeButton.addEventListener('click', function() {
                const email = input.value.trim();
                if (email && email.includes('@')) {
                    showMessage('Successfully subscribed to newsletter!', 'success');
                    input.value = '';
                } else {
                    showMessage('Please enter a valid email address', 'error');
                }
            });
        }
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.testimonial-card, .feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Search functionality for teachers page
    const searchButton = document.querySelector('button');
    searchButton?.addEventListener('click', function() {
        if (this.textContent === 'Search Teachers') {
            const languageSelect = document.querySelector('select');
            const priceSelect = document.querySelectorAll('select')[1];
            const availabilitySelect = document.querySelectorAll('select')[2];
            
            if (languageSelect && languageSelect.value !== 'Select Language') {
                showMessage(`Searching for ${languageSelect.value} teachers...`, 'success');
            } else {
                showMessage('Please select a language to search', 'error');
            }
        }
    });
    
    // Live chat functionality
    const liveChatButton = document.querySelector('button');
    liveChatButton?.addEventListener('click', function() {
        if (this.textContent === 'Start Live Chat') {
            showMessage('Connecting to live chat... A support agent will be with you shortly.', 'success');
        }
    });
    
    // Book lesson buttons
    const bookButtons = document.querySelectorAll('button');
    bookButtons.forEach(button => {
        if (button.textContent === 'Book Lesson') {
            button.addEventListener('click', function() {
                showMessage('Redirecting to booking page...', 'success');
            });
        }
    });
    
    // Enroll now buttons
    const enrollButtons = document.querySelectorAll('button');
    enrollButtons.forEach(button => {
        if (button.textContent === 'Enroll Now') {
            button.addEventListener('click', function() {
                showMessage('Redirecting to enrollment page...', 'success');
            });
        }
    });
    
    // Get started buttons
    const getStartedButtons = document.querySelectorAll('button');
    getStartedButtons.forEach(button => {
        if (button.textContent === 'Get Started') {
            button.addEventListener('click', function() {
                showMessage('Redirecting to sign up page...', 'success');
            });
        }
    });
    
    // Start free trial button
    const trialButton = document.querySelector('button');
    trialButton?.addEventListener('click', function() {
        if (this.textContent === 'Start Your Free Trial') {
            showMessage('Starting your 7-day free trial...', 'success');
        }
    });
});

// Utility function for smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #0f7ff0;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        display: none;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    if (window.pageYOffset > 300) {
        if (!document.getElementById('scrollToTop')) {
            scrollButton.id = 'scrollToTop';
            document.body.appendChild(scrollButton);
            scrollButton.addEventListener('click', scrollToTop);
        }
        document.getElementById('scrollToTop').style.display = 'block';
    } else {
        const existingButton = document.getElementById('scrollToTop');
        if (existingButton) {
            existingButton.style.display = 'none';
        }
    }
});
