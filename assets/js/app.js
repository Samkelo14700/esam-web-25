// ===== MAIN APPLICATION MODULE =====
const ESAM = (() => {
    // ===== PRIVATE VARIABLES =====
    let carouselInterval;
    let currentModal = null;
    
    // ===== MOBILE MENU FUNCTIONALITY =====
    const initMobileMenu = () => {
        const toggleBtn = document.querySelector('.navbar-toggle');
        const menuLinks = document.querySelector('.navbar-links');
        
        if (!toggleBtn || !menuLinks) return;

        toggleBtn.addEventListener('click', () => {
            menuLinks.classList.toggle('active');
            const icon = toggleBtn.querySelector('.toggle-icon');
            icon.textContent = menuLinks.classList.contains('active') ? '✕' : '☰';
        });

        // Close menu on mobile link click
        document.querySelectorAll('.navbar-links a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    menuLinks.classList.remove('active');
                    const icon = document.querySelector('.toggle-icon');
                    if (icon) icon.textContent = '☰';
                }
            });
        });
    };

    // ===== MODAL MANAGEMENT =====
    const handleModals = () => {
        // Toggle modal visibility
        window.toggleForm = (formType) => {
            // Close any open modal first
            if (currentModal) {
                currentModal.style.display = "none";
            }
            
            // Open new modal
            const modal = document.getElementById(`${formType}Modal`);
            if (modal) {
                modal.style.display = "block";
                currentModal = modal;
            }
        };

        // Close modal on outside click
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal') || 
                event.target.classList.contains('signup-modal')) {
                event.target.style.display = "none";
                currentModal = null;
            }
        });
        
        // Close modal on X button click
        document.querySelectorAll('.close, .close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentModal) {
                    currentModal.style.display = "none";
                    currentModal = null;
                }
            });
        });
    };

    // ===== SIGNUP FORM HANDLING =====
    const initSignupForm = () => {
        const signupForm = document.getElementById('signupForm');
        if (!signupForm) return;
        
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const errorMessage = document.getElementById('errorMessage');
            const submitBtn = document.getElementById('submitBtn');
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Reset error message
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';
            
            // Validate passwords match
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match';
                errorMessage.style.display = 'block';
                return;
            }
            
            // Validate terms agreement
            if (!agreeTerms) {
                errorMessage.textContent = 'You must agree to the terms and conditions';
                errorMessage.style.display = 'block';
                return;
            }
            
            // Simulate loading
            submitBtn.textContent = 'Creating Account...';
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Form data collection
                const formData = {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    email: document.getElementById('email').value,
                    university: document.getElementById('university').value,
                    fieldOfStudy: document.getElementById('fieldOfStudy').value,
                    yearOfStudy: document.getElementById('yearOfStudy').value
                };
                
                console.log('Registration data:', formData);
                
                // Show success message
                alert('Account created successfully! Welcome to ESAM.');
                
                // Reset form
                signupForm.reset();
                submitBtn.textContent = 'Sign Up';
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                // Close modal
                toggleForm('signup');
            }, 1500);
        });
    };

    // ===== TESTIMONIAL CAROUSEL =====
    const initTestimonials = () => {
        const testimonials = document.querySelectorAll('.testimonial');
        if (!testimonials.length) return;

        let currentIndex = 0;
        
        const showTestimonial = (index) => {
            testimonials.forEach((t, i) => {
                t.style.display = i === index ? 'block' : 'none';
            });
        };

        // Auto-rotate with pause on hover
        const startCarousel = () => {
            carouselInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % testimonials.length;
                showTestimonial(currentIndex);
            }, 5000); // Rotate every 5 seconds
        };

        // Pause on hover
        const carouselContainer = document.querySelector('.testimonial-carousel');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => {
                clearInterval(carouselInterval);
            });
            carouselContainer.addEventListener('mouseleave', startCarousel);
        }

        showTestimonial(0);
        startCarousel();
    };

    // ===== ALUMNI DATA HANDLING =====
    const initAlumni = () => {
        const alumniData = {
            "2020": [
                {
                    name: "Dr. Lerato Mamba",
                    position: "Medical Doctor, Tunisia",
                    testimonial: "ESAM's mentorship program prepared me for North African healthcare systems",
                    photo: "assets/images/alumni/lerato.jpg"
                },
                {
                    name: "Thabo Dlamini",
                    position: "Civil Engineer, Eswatini",
                    testimonial: "The networking events helped me secure my first job back home",
                    photo: "assets/images/alumni/thabo.jpg"
                }
            ],
            "2021": [
                {
                    name: "Nkosi Zwane",
                    position: "Software Engineer, Google",
                    testimonial: "The coding workshops gave me my first Python skills",
                    photo: "assets/images/alumni/nkosi.jpg"
                },
                {
                    name: "Nomthandazo Nkosi",
                    position: "Financial Analyst, Morocco",
                    testimonial: "ESAM provided crucial support during my internship search",
                    photo: "assets/images/alumni/nomthandazo.jpg"
                }
            ]
        };

        // Render alumni profiles
        const renderAlumni = (year) => {
            const container = document.querySelector('.alumni-profiles');
            if (!container) return;

            container.innerHTML = '';
            alumniData[year].forEach(member => {
                const alumniCard = document.createElement('div');
                alumniCard.className = 'alumni-card';
                alumniCard.innerHTML = `
                    <img src="${member.photo}" alt="${member.name}">
                    <h4>${member.name}</h4>
                    <p><strong>${member.position}</strong></p>
                    <p>"${member.testimonial}"</p>
                `;
                container.appendChild(alumniCard);
            });
        };

        // Tab functionality
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderAlumni(e.target.dataset.year);
            });
        });

        // Initial render
        if (document.querySelector('.tab-btn.active')) {
            const activeYear = document.querySelector('.tab-btn.active').dataset.year;
            renderAlumni(activeYear);
        } else if (document.querySelector('.tab-btn')) {
            document.querySelector('.tab-btn').classList.add('active');
            renderAlumni(document.querySelector('.tab-btn').dataset.year);
        }
    };

    // ===== MAP FUNCTIONALITY =====
    const initMap = () => {
        const mapContainer = document.getElementById('esam-map-container');
        if (!mapContainer) return;

        const loader = mapContainer.querySelector('.map-loader');
        const mapSvg = document.getElementById('esam-map-svg')
        // If we have the SVG, show it and hide loader

        if (mapSvg) {
            loader.style.display = 'none';
            mapSvg.style.display = 'block';
            initMapInteractions();
            }
        };

    const initMapInteractions = () => {
        // Tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'map-tooltip';
        document.querySelector('.map-container').appendChild(tooltip);
    
        // Country hover effects
        document.querySelectorAll('.country').forEach(country => {
            country.addEventListener('mouseenter', function() {
                this.style.strokeWidth = '2px';
                this.style.opacity = '0.9';
            });
        
            country.addEventListener('mouseleave', function() {
                this.style.strokeWidth = '0.5px';
                this.style.opacity = '1';
            });
        });

        document.querySelectorAll('.member').forEach(point => {
            point.addEventListener('mouseover', (e) => {
                // Enlarge point
                this.setAttribute('r', '8');
                
                // Position tooltip
                const rect = point.getBoundingClientRect();
                const containerRect = document.querySelector('.map-container').getBoundingClientRect();
            
                tooltip.textContent = `${point.getAttribute('data-count')} members`;
                tooltip.style.display = 'block';
                tooltip.style.left = `${rect.left - containerRect.left + 15}px`;
                tooltip.style.top = `${rect.top - containerRect.top - 30}px`;
            });
        
            point.addEventListener('mouseleave', function() {
                // Restore point size
                this.setAttribute('r', '5');
            
                // Hide tooltip
                tooltip.style.display = 'none';
            });
        });
    
        // Add click event to countries
        document.getElementById('morocco').addEventListener('click', () => {
            alert('Showing members from Morocco');
        });
    
        document.getElementById('eswatini').addEventListener('click', () => {
            alert('Showing members from Eswatini');
        });
    };

    // Initialize map when in viewport
    const initMapOnView = () => {
        const mapSection = document.querySelector('.map-section')
        if(!mapSection) return;

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    initMap();
                    observer.disconnect();
                }
            }, {
                threshold: 0.1 // Trigger when 10% visible
            });
        
            observer.observe('.mapSection');
        };

    // ===== FORM VALIDATION =====
    const initFormValidation = () => {
        // Contact form validation
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                const nameInput = contactForm.querySelector('#name');
                const emailInput = contactForm.querySelector('#email');
                let valid = true;
                
                if (!nameInput.value.trim()) {
                    valid = false;
                    showError(nameInput, 'Name is required');
                }
                
                if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
                    valid = false;
                    showError(emailInput, 'Valid email is required');
                }
                
                if (!valid) e.preventDefault();
            });
        }
        // Add reCAPTCHA validation
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                if (this.querySelector('.g-recaptcha') && 
                    !grecaptcha.getResponse()) {
                    e.preventDefault();
                    alert('Please complete the reCAPTCHA');
                }
            });
        });
        
        // Spotlight form validation
        const spotlightForm = document.querySelector('.spotlight-form form');
        if (spotlightForm) {
            spotlightForm.addEventListener('submit', (e) => {
                const storyTextarea = spotlightForm.querySelector('textarea[name="story"]');
                let valid = true;
                
                if (!storyTextarea.value.trim() || storyTextarea.value.trim().split(/\s+/).length > 300) {
                    valid = false;
                    showError(storyTextarea, 'Story must be under 300 words');
                }
                
                if (!valid) e.preventDefault();
            });
        }
        
        // Alumni form validation
        const alumniForm = document.querySelector('.alumni-form form');
        if (alumniForm) {
            alumniForm.addEventListener('submit', (e) => {
                const nameInput = alumniForm.querySelector('input[name="name"]');
                const yearInput = alumniForm.querySelector('input[name="year"]');
                const positionInput = alumniForm.querySelector('input[name="position"]');
                const testimonialTextarea = alumniForm.querySelector('textarea[name="testimonial"]');
                let valid = true;
                
                if (!nameInput.value.trim()) {
                    valid = false;
                    showError(nameInput, 'Full name is required');
                }
                
                if (!yearInput.value.trim() || yearInput.value < 2010 || yearInput.value > 2025) {
                    valid = false;
                    showError(yearInput, 'Valid graduation year required (2010-2025)');
                }
                
                if (!positionInput.value.trim()) {
                    valid = false;
                    showError(positionInput, 'Current position is required');
                }
                
                if (!testimonialTextarea.value.trim()) {
                    valid = false;
                    showError(testimonialTextarea, 'Please share your success story');
                }
                
                if (!valid) e.preventDefault();
            });
        }
    };
    
    const showError = (input, message) => {
        // Remove existing error
        const existingError = input.nextElementSibling;
        if (existingError && existingError.classList.contains('error-message')) {
            existingError.remove();
        }
        
        // Create error element
        const error = document.createElement('p');
        error.className = 'error-message';
        error.textContent = message;
        error.style.color = '#CE1126';
        error.style.fontSize = '0.85rem';
        error.style.marginTop = '5px';
        input.after(error);
        
        // Highlight input
        input.style.borderColor = '#CE1126';
        input.addEventListener('input', () => {
            error.remove();
            input.style.borderColor = '#ddd';
        }, { once: true });
    };
    
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // ===== SMOOTH SCROLLING =====
    const initSmoothScrolling = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // ===== LAZY LOADING =====
    const initLazyLoading = () => {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => {
                img.dataset.src = img.src;
                img.removeAttribute('src');
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    };

    // ===== INITIALIZATION =====
    const init = () => {
        // Core functionality
        initMobileMenu();
        handleModals();
        initSignupForm();  // Initialize signup form
        initTestimonials();
        initFormValidation();
        initSmoothScrolling();
        initLazyLoading();
        
        // Optional modules
        if (document.querySelector('.alumni')) initAlumni();

        // Initialize map if section exists
        if (document.querySelector('.map-section')) {
            initMapOnView();
        }

        // Cleanup on window close
        window.addEventListener('beforeunload', () => {
            clearInterval(carouselInterval);
        });
    };

    return { init };
})();

// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', ESAM.init);