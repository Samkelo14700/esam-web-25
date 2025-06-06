// ===== MAIN APPLICATION MODULE =====
//const ESAM = (() => {
if (typeof ESAM === 'undefined'){
        var ESAM = (() => {
        // ===== PRIVATE VARIABLES =====
        let carouselInterval;
        let currentModal = null;

        // ===== USER AUTHENTICATION =====
        const USERS_KEY = 'esam_users';
        const SESSION_KEY = 'esam_session'; // Add session key
        const SESSION_EXPIRY = 30 * 60 * 1000; // 30 minutes - Add this line

        // Get all users (public)
        const getAllUsers = () => {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        };

        // Get stored users
        const getUsers = () => {
            const users = localStorage.getItem(USERS_KEY);
            return users ? JSON.parse(users) : [];
        };

        // Save user to storage
        const saveUser = (user) => {
            // Add password hashing
            user.password = CryptoJS.SHA256(user.password).toString();
            const users = getUsers();
            users.push(user);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        };

        // Authenticate user
        const authenticateUser = (email, password) => {
            const users = getUsers();    
            const hashedPassword = CryptoJS.SHA256(password).toString();
            const user = users.find(user => 
                user.email.toLowerCase() === email.toLowerCase() && 
                user.password === hashedPassword
            );
            return user || null;
        };

        // Set current user
        const setCurrentUser = (user) => {
            // Add session management
            const sessionData = {
                user,
                expiry: Date.now() + SESSION_EXPIRY
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        };

        // Get current user
        const getCurrentUser = () => {
            // Add session expiration check
            const session = localStorage.getItem(SESSION_KEY);
            if (!session) return null;
            
            const sessionData = JSON.parse(session);
            // Renew session on each access
            if (Date.now() > sessionData.expiry - (15 * 60 * 1000)) {
                sessionData.expiry = Date.now() + SESSION_EXPIRY;
                localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            }

            if (Date.now() > sessionData.expiry) {
                logoutUser();
                return null;
            }
            return sessionData.user;
        };

        // Logout user
        const logoutUser = () => {
            // Update to clear session
            localStorage.removeItem(SESSION_KEY);
        };

        // Update authentication UI
        const updateAuthUI = () => {
            const authLinks = document.getElementById('authLinks');
            const userLinks = document.getElementById('userLinks');
            const usernameSpan = document.getElementById('navbarUsername');
            const logoutBtn = document.getElementById('logoutBtn');
            const user = getCurrentUser();

            if (user) {
                if (authLinks) authLinks.style.display = 'none';
                if (userLinks) userLinks.style.display = 'flex';
                if (usernameSpan) usernameSpan.textContent = user.name.split(' ')[0]; // First name
                
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        logoutUser();
                        updateAuthUI();
                        window.location.href = 'index.html';
                    });
                }
            } else {
                if (authLinks) authLinks.style.display = 'flex';
                if (userLinks) userLinks.style.display = 'none';
            }
        };

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

        // ===== GLOBAL FUNCTIONS =====
        window.rsvpEvent = function(button, eventName) {
            if (button.classList.contains('confirmed')) {
                button.classList.remove('confirmed');
                button.innerHTML = '<i class="fas fa-calendar-check"></i> RSVP Now';
                alert(`You've canceled your RSVP for: ${eventName}`);
            } else {
                button.classList.add('confirmed');
                button.innerHTML = '<i class="fas fa-check"></i> Confirmed!';
                alert(`Thank you for RSVPing to: ${eventName}`);
                
                // Log the RSVP in localStorage
                const userId = ESAM.getCurrentUser()?.id;
                if(userId) {
                    const rsvps = JSON.parse(localStorage.getItem('esam_rsvps') || '{}');
                    rsvps[eventName] = rsvps[eventName] || [];
                    if(!rsvps[eventName].includes(userId)) {
                        rsvps[eventName].push(userId);
                        localStorage.setItem('esam_rsvps', JSON.stringify(rsvps));
                    }
                }
            }
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
                
                // Create user object
                const user = {
                    id: `ESAM-${Date.now().toString().slice(-5)}`,
                    name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
                    email: document.getElementById('signup-email').value.trim().toLowerCase(),
                    password: password, // Note: In production, hash passwords
                    university: document.getElementById('university').value,
                    fieldOfStudy: document.getElementById('fieldOfStudy').value,
                    yearOfStudy: document.getElementById('yearOfStudy').value,
                    joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
                    lastLogin: new Date().toISOString(),
                    membershipLevel: 'Premium'
                };
                
                // Save user and set as current
                console.log('Creating user:', user);

                saveUser(user);
                setCurrentUser(user);
                updateAuthUI();

                console.log('Stored users:', JSON.parse(localStorage.getItem(USERS_KEY)));
                
                // Show success message
                setTimeout(() => {
                    alert('Account created successfully! Welcome to ESAM.');
                    
                    // Reset form
                    signupForm.reset();
                    submitBtn.textContent = 'Sign Up';
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                    
                    // Close modal
                    toggleForm('signup');
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                }, 1500);
            });
        };

        // ===== LOGIN FORM HANDLING =====
        const initLoginForm = () => {
            const loginForm = document.getElementById('loginForm');
            if (!loginForm) return;

            // Create error message element if it doesn't exist
            let errorElement = loginForm.querySelector('.login-error');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message login-error';
                loginForm.parentNode.insertBefore(errorElement, loginForm);
            }

            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                errorElement.style.display = 'none';
                
                const email = this.email.value.trim().toLowerCase();
                const password = this.password.value;
                
                const user = authenticateUser(email, password);
                if (user) {
                    // Add session renewal
                    setCurrentUser(user);
                    updateAuthUI();
                    toggleForm('login');
                    window.location.href = 'dashboard.html';
                } else {
                    errorElement.textContent = 'Invalid email or password. Please try again.';
                    errorElement.style.display = 'block';
                    
                    // Add shake animation for better UX
                    loginForm.classList.add('shake');
                    setTimeout(() => {
                        loginForm.classList.remove('shake');
                    }, 500);
                }
            });
        };

        // Add this new function for session checking
        const checkSession = () => {
            const user = getCurrentUser();
            if (!user && window.location.pathname.includes('dashboard.html')) {
                window.location.href = 'index.html';
            }
            return user;
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

        // ===== BLOG ENHANCEMENTS =====
        const initBlog = () => {
            const blogGrid = document.querySelector('.blog-grid');
            if (!blogGrid) return;
            
            // Add "Read More" functionality
            document.querySelectorAll('.blog-content').forEach(content => {
                const fullText = content.querySelector('p').textContent;
                const words = fullText.split(' ');
                
                if (words.length > 30) {
                    const excerpt = words.slice(0, 30).join(' ') + '...';
                    const fullContent = words.join(' ');
                    
                    content.querySelector('p').textContent = excerpt;
                    
                    const readMoreBtn = document.createElement('button');
                    readMoreBtn.className = 'read-more-btn';
                    readMoreBtn.textContent = 'Read More';
                    
                    readMoreBtn.addEventListener('click', () => {
                        if (content.querySelector('p').textContent === excerpt) {
                            content.querySelector('p').textContent = fullContent;
                            readMoreBtn.textContent = 'Read Less';
                        } else {
                            content.querySelector('p').textContent = excerpt;
                            readMoreBtn.textContent = 'Read More';
                        }
                    });
                    
                    content.appendChild(readMoreBtn);
                }
            });
            
            // Add comment functionality
            document.querySelectorAll('.blog-post').forEach(post => {
                const commentSection = document.createElement('div');
                commentSection.className = 'blog-comments';
                commentSection.innerHTML = `
                    <h4>Comments</h4>
                    <div class="comments-container"></div>
                    <form class="comment-form">
                        <textarea placeholder="Add a comment..." required></textarea>
                        <button type="submit">Post Comment</button>
                    </form>
                `;
                post.querySelector('.blog-content').appendChild(commentSection);
                
                const commentsContainer = commentSection.querySelector('.comments-container');
                const commentForm = commentSection.querySelector('.comment-form');
                
                // Load comments from localStorage
                const postId = post.dataset.id || 'post-' + Date.now();
                post.dataset.id = postId;
                
                const loadComments = () => {
                    const comments = JSON.parse(localStorage.getItem(`blog-comments-${postId}`)) || [];
                    commentsContainer.innerHTML = '';
                    
                    comments.forEach(comment => {
                        const commentElement = document.createElement('div');
                        commentElement.className = 'comment';
                        commentElement.innerHTML = `
                            <strong>${comment.name || 'Anonymous'}</strong>
                            <span class="comment-date">${new Date(comment.date).toLocaleDateString()}</span>
                            <p>${comment.text}</p>
                        `;
                        commentsContainer.appendChild(commentElement);
                    });
                };
                
                // Save comment
                commentForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const textarea = this.querySelector('textarea');
                    const commentText = textarea.value.trim();
                    
                    if (commentText) {
                        const user = getCurrentUser() || { name: 'Anonymous' };
                        const comments = JSON.parse(localStorage.getItem(`blog-comments-${postId}`)) || [];
                        
                        comments.push({
                            text: commentText,
                            name: user.name,
                            date: new Date().toISOString()
                        });
                        
                        localStorage.setItem(`blog-comments-${postId}`, JSON.stringify(comments));
                        textarea.value = '';
                        loadComments();
                    }
                });
                
                loadComments();
            });
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

        // ===== RESOURCES ENHANCEMENTS =====
        const initResources = () => {
            const resourceGrid = document.querySelector('.resource-grid');
            if (!resourceGrid) return;
            
            // Add resource filtering
            const filterContainer = document.createElement('div');
            filterContainer.className = 'resource-filter';
            filterContainer.innerHTML = `
                <input type="text" id="resourceSearch" placeholder="Search resources...">
                <div class="filter-tags">
                    <button class="filter-tag active" data-filter="all">All</button>
                    <button class="filter-tag" data-filter="study">Study</button>
                    <button class="filter-tag" data-filter="career">Career</button>
                    <button class="filter-tag" data-filter="community">Community</button>
                </div>
            `;
            resourceGrid.parentNode.insertBefore(filterContainer, resourceGrid);
            
            // Filter functionality
            const searchInput = document.getElementById('resourceSearch');
            const filterTags = document.querySelectorAll('.filter-tag');
            
            const filterResources = () => {
                const searchTerm = searchInput.value.toLowerCase();
                const activeFilter = document.querySelector('.filter-tag.active').dataset.filter;
                
                document.querySelectorAll('.resource-card').forEach(card => {
                    const text = card.textContent.toLowerCase();
                    const matchesSearch = text.includes(searchTerm);
                    const matchesFilter = activeFilter === 'all' || card.classList.contains(activeFilter);
                    
                    card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
                });
            };
            
            searchInput.addEventListener('input', filterResources);
            
            filterTags.forEach(tag => {
                tag.addEventListener('click', () => {
                    filterTags.forEach(t => t.classList.remove('active'));
                    tag.classList.add('active');
                    filterResources();
                });
            });
            
            // Add download counters
            document.querySelectorAll('.resource-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    if (!this.dataset.downloaded) {
                        const counter = this.querySelector('.download-count') || document.createElement('span');
                        counter.className = 'download-count';
                        
                        let count = parseInt(counter.textContent) || 0;
                        counter.textContent = ` (${count + 1})`;
                        
                        if (!this.querySelector('.download-count')) {
                            this.appendChild(counter);
                        }
                        
                        this.dataset.downloaded = "true";
                        
                        // Simulate download delay
                        e.preventDefault();
                        setTimeout(() => {
                            window.location.href = this.href;
                        }, 1000);
                    }
                });
            });
        };

        // ===== MARKETPLACE FUNCTIONALITY =====
        const initMarketplace = () => {
            const MARKETPLACE_KEY = 'esam_marketplace_items';
            const itemsContainer = document.querySelector('.items-grid');
            const itemForm = document.getElementById('itemForm');
            
            if (!itemsContainer || !itemForm) return;

            // Get marketplace items from storage
            const getItems = () => {
                const items = localStorage.getItem(MARKETPLACE_KEY);
                return items ? JSON.parse(items) : [];
            };

            // Save item to storage
            const saveItem = (item) => {
                const items = getItems();
                items.push(item);
                localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(items));
            };

            // Render marketplace items
            const renderItems = () => {
                const items = getItems();
                itemsContainer.innerHTML = '';
                
                if (items.length === 0) {
                    itemsContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-box-open"></i>
                            <p>No items listed yet. Be the first to sell something!</p>
                        </div>
                    `;
                    return;
                }
                
                items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'marketplace-item';
                    itemElement.innerHTML = `
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <p class="item-price">${item.price} MAD</p>
                            <p class="item-category">${item.category}</p>
                            <p class="item-condition">${item.condition}</p>
                            <p class="item-description">${item.description}</p>
                            <p class="item-contact">Contact: ${item.contact}</p>
                            <p class="item-date">Posted: ${item.date}</p>
                        </div>
                    `;
                    itemsContainer.appendChild(itemElement);
                });
            };

            // Handle form submission
            itemForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get current user
                const user = getCurrentUser();
                if (!user) {
                    alert('Please log in to list an item');
                    return;
                }

                const itemName = document.getElementById('itemName').value;
                const itemPrice = document.getElementById('itemPrice').value;
                const itemDescription = document.getElementById('itemDescription').value;
                const itemCategory = document.getElementById('itemCategory').value;
                const itemCondition = document.getElementById('itemCondition').value;
                const itemContact = document.getElementById('itemContact').value;
                const itemPhotos = document.getElementById('itemPhotos').files[0];
                
                // Basic validation
                if (!itemName || !itemPrice || !itemDescription || !itemContact || !itemPhotos) {
                    alert('Please fill all required fields');
                    return;
                }
                
                // Create item object
                const newItem = {
                    id: Date.now().toString(),
                    userId: user.id,
                    name: itemName,
                    price: `${itemPrice} MAD`,
                    description: itemDescription,
                    category: itemCategory,
                    condition: itemCondition,
                    contact: itemContact,
                    date: new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    }),
                    image: URL.createObjectURL(itemPhotos) // Create temporary URL
                };
                
                // Save and render
                saveItem(newItem);
                renderItems();
                
                // Reset form
                itemForm.reset();
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'form-success';
                successMsg.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    Item listed successfully!
                `;
                itemForm.parentNode.insertBefore(successMsg, itemForm);
                
                // Remove message after 3 seconds
                setTimeout(() => successMsg.remove(), 3000);
            });

            // Initial render
            renderItems();
        }

        // ===== GALLERY ENHANCEMENTS =====
        const initGallery = () => {
            const galleryContainer = document.querySelector('.gallery-grid');
            if (!galleryContainer) return;
            
            // Add lightbox functionality
            galleryContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'IMG') {
                    const lightbox = document.createElement('div');
                    lightbox.className = 'gallery-lightbox';
                    lightbox.innerHTML = `
                        <div class="lightbox-content">
                            <img src="${e.target.parentElement.href}" alt="${e.target.alt}">
                            <div class="lightbox-caption">${e.target.parentElement.dataset.title}</div>
                            <button class="lightbox-close">&times;</button>
                            <button class="lightbox-prev">❮</button>
                            <button class="lightbox-next">❯</button>
                        </div>
                    `;
                    document.body.appendChild(lightbox);
                    
                    // Close lightbox
                    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
                        lightbox.remove();
                    });
                    
                    // Navigation
                    const images = Array.from(galleryContainer.querySelectorAll('a'));
                    const currentIndex = images.indexOf(e.target.parentElement);
                    
                    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
                        const prevIndex = (currentIndex - 1 + images.length) % images.length;
                        lightbox.querySelector('img').src = images[prevIndex].href;
                        lightbox.querySelector('.lightbox-caption').textContent = images[prevIndex].dataset.title;
                    });
                    
                    lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
                        const nextIndex = (currentIndex + 1) % images.length;
                        lightbox.querySelector('img').src = images[nextIndex].href;
                        lightbox.querySelector('.lightbox-caption').textContent = images[nextIndex].dataset.title;
                    });
                }
            });
            
            // Add shuffle functionality
            const shuffleBtn = document.createElement('button');
            shuffleBtn.className = 'shuffle-btn';
            shuffleBtn.innerHTML = '<i class="fas fa-random"></i> Shuffle';
            document.querySelector('.gallery').insertBefore(shuffleBtn, galleryContainer);
            
            shuffleBtn.addEventListener('click', () => {
                const images = Array.from(galleryContainer.children);
                for (let i = images.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [images[i], images[j]] = [images[j], images[i]];
                }
                images.forEach(img => galleryContainer.appendChild(img));
            });
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
                    grecaptcha.ready(() => {
                        if (this.querySelector('.g-recaptcha') && 
                            !grecaptcha.getResponse()) {
                            e.preventDefault();
                            alert('Please complete the reCAPTCHA');
                        }
                    });
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

        // ===== ACCOUNT DELETION FUNCTIONS =====
        const deleteUserAccount = (userId) => {
            // 1. Remove user from users list
            const users = getUsers();
            const updatedUsers = users.filter(user => user.id !== userId);
            localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
            
            // 2. Clear current session
            logoutUser();
            localStorage.removeItem(`user_settings_${userId}`);
            localStorage.removeItem(`user_resources_${userId}`);
            
            // 3. Remove user-specific data
            deleteUserMarketplaceItems(userId);
            deleteUserComments(userId);
            deleteUserSpotlightSubmissions(userId);
            
            // 4. Redirect to home
            return true;
        };

        const deleteUserMarketplaceItems = (userId) => {
            const MARKETPLACE_KEY = 'esam_marketplace_items';
            const items = JSON.parse(localStorage.getItem(MARKETPLACE_KEY)) || [];
            const updatedItems = items.filter(item => item.userId !== userId);
            localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(updatedItems));
        };

        const deleteUserComments = (userId) => {
            // Delete blog comments
            document.querySelectorAll('.blog-post').forEach(post => {
                const postId = post.dataset.id;
                const key = `blog-comments-${postId}`;
                const comments = JSON.parse(localStorage.getItem(key)) || [];
                const updatedComments = comments.filter(comment => comment.userId !== userId);
                localStorage.setItem(key, JSON.stringify(updatedComments));
            });
            
            // Delete spotlight comments
            const spotlightKey = 'esam_spotlight_comments';
            const spotlightComments = JSON.parse(localStorage.getItem(spotlightKey)) || [];
            const updatedSpotlightComments = spotlightComments.filter(c => c.userId !== userId);
            localStorage.setItem(spotlightKey, JSON.stringify(updatedSpotlightComments));
        };

        const deleteUserSpotlightSubmissions = (userId) => {
            const SPOTLIGHT_KEY = 'esam_spotlight_submissions';
            const submissions = JSON.parse(localStorage.getItem(SPOTLIGHT_KEY)) || [];
            const updatedSubmissions = submissions.filter(sub => sub.userId !== userId);
            localStorage.setItem(SPOTLIGHT_KEY, JSON.stringify(updatedSubmissions));
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
            // Add session check
            const user = checkSession();
            if (!user) {
                // Redirect to login if session expired
                if (!window.location.href.includes('index.html')) {
                    window.location.href = 'index.html';
                }
            }

            // Core functionality
            initMobileMenu();
            handleModals();
            initSignupForm();
            initLoginForm();
            initTestimonials();
            initFormValidation();
            initSmoothScrolling();
            initLazyLoading();
            
            // Optional modules
            if (document.querySelector('.alumni')) initAlumni();
            if (document.querySelector('.gallery')) initGallery();
            if (document.querySelector('.resources')) initResources();
            if (document.querySelector('.blog')) initBlog();

            // Initialize map if section exists
            if (document.querySelector('.marketplace-section')) {
                initMarketplace();
            }

            // Update auth UI
            updateAuthUI();

            // Cleanup on window close
            window.addEventListener('beforeunload', () => {
                clearInterval(carouselInterval);
            });
        };
        return {
            init,
            deleteUserAccount,
            getCurrentUser,
            getAllUsers
        };
    })();
}

// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', ESAM.init);