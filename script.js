// ===== THREE.JS PARTICLE SYSTEM =====
let scene, camera, renderer, particles;

function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('threejs-background'),
        alpha: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create particles
    createParticleSystem();
    
    camera.position.z = 5;
    
    // Start animation loop
    animate();
}

function createParticleSystem() {
    const particleCount = window.innerWidth < 768 ? 50 : 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 10;
        positions[i + 1] = (Math.random() - 0.5) * 10;
        positions[i + 2] = (Math.random() - 0.5) * 10;
        
        colors[i] = 0.4 + Math.random() * 0.6;
        colors[i + 1] = 0.5 + Math.random() * 0.5;
        colors[i + 2] = 0.9;
        
        sizes[i / 3] = Math.random() * 3 + 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(time + position.x) * 0.1);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                gl_FragColor = vec4(vColor, alpha * 0.6);
            }
        `,
        transparent: true,
        vertexColors: true
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    if (particles) {
        particles.rotation.x = time * 0.05;
        particles.rotation.y = time * 0.075;
        particles.material.uniforms.time.value = time;
    }
    
    renderer.render(scene, camera);
}

// Handle window resize
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleResize);

// ===== MOBILE NAVIGATION =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
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

// Navbar background on scroll - theme aware
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (window.scrollY > 100) {
        if (currentTheme === 'light') {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        }
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'var(--glass-bg)';
        navbar.style.boxShadow = 'none';
    }
});

// ===== ENHANCED SCROLL ANIMATIONS =====
const enhancedObserverOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const enhancedObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            
            // Add stagger animation to child elements
            const children = entry.target.querySelectorAll('.project-card, .skill-item, .skill-category, .experience-item, .about-highlights .highlight');
            children.forEach((child, index) => {
                setTimeout(() => {
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    });
}, enhancedObserverOptions);

// Mouse follow cursor
let mouseFollower;
function createMouseFollower() {
    mouseFollower = document.createElement('div');
    mouseFollower.className = 'mouse-follow';
    document.body.appendChild(mouseFollower);
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        
        if (mouseFollower) {
            mouseFollower.style.left = followerX + 'px';
            mouseFollower.style.top = followerY + 'px';
        }
        
        requestAnimationFrame(animateFollower);
    }
    
    animateFollower();
}

// Enhanced scroll-triggered animations
function initScrollAnimations() {
    // Observe sections with reveal class
    const revealSections = document.querySelectorAll('.reveal');
    revealSections.forEach(section => {
        enhancedObserver.observe(section);
    });
    
    // Add enhanced hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.project-card, .skill-item, .contact-item, .btn');
    interactiveElements.forEach(element => {
        element.classList.add('enhanced-hover');
        
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-5px) scale(1.02)';
            if (mouseFollower) {
                mouseFollower.style.transform = 'translate(-50%, -50%) scale(1.5)';
                mouseFollower.style.borderColor = '#667eea';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0) scale(1)';
            if (mouseFollower) {
                mouseFollower.style.transform = 'translate(-50%, -50%) scale(1)';
                mouseFollower.style.borderColor = 'rgba(102, 126, 234, 0.5)';
            }
        });
    });
}

// Typing animation for hero title
class TypeWriter {
    constructor(txtElement, words, wait = 3000) {
        this.txtElement = txtElement;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.type();
        this.isDeleting = false;
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;

        let typeSpeed = 100;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Initialize typing animation on load
document.addEventListener('DOMContentLoaded', () => {
    const txtElement = document.querySelector('.txt-type');
    if (txtElement) {
        const words = ['AI/ML Engineer', 'Backend Developer', 'Cloud Architect', 'Tech Innovator'];
        new TypeWriter(txtElement, words, 800);
    }
});

// ===== ENHANCED PROJECT CARD INTERACTIONS =====
function initProjectCardEffects() {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale(1.02)`;
            card.style.boxShadow = '0 25px 50px rgba(102, 126, 234, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
        });
        
        // Add click animation
        card.addEventListener('mousedown', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(2px) scale(0.98)';
        });
        
        card.addEventListener('mouseup', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(-5px) scale(1.02)';
        });
    });
}

// Smooth reveal animation for elements
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

// Contact form animation
function animateContactForm() {
    const contactInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    
    contactInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.parentElement.classList.remove('focused');
            }
        });
    });
}

// ===== INTERACTIVE FLOATING ELEMENTS =====
function animateFloatingShapes() {
    const shapes = document.querySelectorAll('.floating-shape');
    
    shapes.forEach((shape, index) => {
        let startTime = Date.now() + index * 1000;
        
        function updateShape() {
            const elapsed = (Date.now() - startTime) * 0.001;
            const x = Math.sin(elapsed * 0.5 + index) * 30;
            const y = Math.cos(elapsed * 0.3 + index) * 20;
            const rotation = elapsed * 20 + index * 60;
            
            shape.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            requestAnimationFrame(updateShape);
        }
        
        updateShape();
    });
}

// ===== PERFORMANCE OPTIMIZATIONS =====
let ticking = false;

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
    }
}

function updateAnimations() {
    // Update any frame-based animations here
    ticking = false;
}

// Debounced scroll handler
let scrollTimeout;
function handleScroll() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
        requestTick();
    }, 10);
}

window.addEventListener('scroll', handleScroll, { passive: true });

// ===== SECTION TRANSITIONS =====
function addSectionTransitions() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('section-transition');
    });
}

// ===== THEME TOGGLE FUNCTIONALITY =====
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Get saved theme from localStorage or use system preference
    const savedTheme = localStorage.getItem('theme');
    const defaultTheme = savedTheme || (prefersDark.matches ? 'dark' : 'light');
    
    // Set initial theme
    setTheme(defaultTheme);
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        
        // Add click animation
        themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    });
    
    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update Three.js particle colors based on theme
    updateParticleColors(theme);
    
    // Trigger theme change event for other components
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
    
    console.log(`🎨 Theme switched to: ${theme}`);
}

function updateParticleColors(theme) {
    if (particles && particles.material) {
        const colors = particles.geometry.attributes.color;
        const colorArray = colors.array;
        
        for (let i = 0; i < colorArray.length; i += 3) {
            if (theme === 'light') {
                // Darker particles for light theme
                colorArray[i] = 0.2 + Math.random() * 0.4;     // R
                colorArray[i + 1] = 0.3 + Math.random() * 0.4; // G
                colorArray[i + 2] = 0.6 + Math.random() * 0.4; // B
            } else {
                // Brighter particles for dark theme
                colorArray[i] = 0.4 + Math.random() * 0.6;     // R
                colorArray[i + 1] = 0.5 + Math.random() * 0.5; // G
                colorArray[i + 2] = 0.9;                       // B
            }
        }
        
        colors.needsUpdate = true;
    }
}

// ===== ENHANCED THEME ANIMATIONS =====
function addThemeTransitionEffects() {
    // Add smooth transition to all elements when theme changes
    const style = document.createElement('style');
    style.textContent = `
        * {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
        }
        
        .theme-transition-disable * {
            transition: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Listen for theme changes and add transition effects
    window.addEventListener('themeChange', (e) => {
        // Temporarily disable transitions during theme switch
        document.body.classList.add('theme-transition-disable');
        
        setTimeout(() => {
            document.body.classList.remove('theme-transition-disable');
        }, 50);
        
        // Update navbar scroll background for new theme
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            if (e.detail.theme === 'light') {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            }
        }
        
        // Add a subtle flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${e.detail.theme === 'light' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
            pointer-events: none;
            z-index: 10000;
            opacity: 1;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(flash);
            }, 300);
        }, 100);
    });
}

// Scroll progress indicator
function addScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// Make skill cards non-interactive (display only)
function removeSkillCardInteractivity() {
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.style.cursor = 'default';
        card.removeAttribute('data-skill');
        // Remove any existing click handlers by cloning
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
    });
}

// ===== INITIALIZE ALL SYSTEMS =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing interactive portfolio...');
    
    // Initialize theme system first
    initThemeToggle();
    addThemeTransitionEffects();
    
    // Initialize Three.js particle system
    initThreeJS();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Create mouse follower (desktop only)
    if (window.innerWidth > 768) {
        createMouseFollower();
    }
    
    // Animate floating shapes
    animateFloatingShapes();
    
    // Add section transitions
    addSectionTransitions();
    
    // Initialize contact form animations
    animateContactForm();
    
    // Initialize project card effects
    initProjectCardEffects();
    
    // Add scroll progress
    addScrollProgress();
    
    // Remove skill card interactivity (no popups)
    removeSkillCardInteractivity();
    
    // Add loading animation
    document.body.classList.add('loaded');
    
    console.log('✅ Portfolio interactive systems initialized');
});

// Loading screen animation
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
});

// Add particle background effect
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    
    document.body.appendChild(particleContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(102, 126, 234, 0.3);
            border-radius: 50%;
            animation: float ${5 + Math.random() * 10}s infinite linear;
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 10}s;
        `;
        
        particleContainer.appendChild(particle);
    }
}

// ===== RESUME MODAL FUNCTIONS =====
function openResumeModal() {
    const modal = document.getElementById('resumeModal');
    const iframe = document.getElementById('resumeIframe');
    const loading = document.querySelector('.iframe-loading');
    
    // Reset loading state
    loading.style.display = 'flex';
    loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Loading resume...';
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Set iframe source - try embedded version first
    const fileId = '1q_NzwYUs6JCO13k73l2ZvPncUTUaIApS';
    const resumeEmbedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    
    // Alternative: Use the embedded viewer URL
    // const resumeEmbedUrl = `https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;
    
    iframe.src = resumeEmbedUrl;
    
    // Hide loading when iframe loads successfully
    iframe.onload = function() {
        setTimeout(() => {
            loading.style.display = 'none';
        }, 1000); // Give it a second to fully load
    };
    
    // Handle iframe load errors
    iframe.onerror = function() {
        loading.innerHTML = '<i class="fas fa-exclamation-triangle"></i>Failed to load resume. <a href="' + resumeEmbedUrl + '" target="_blank">Open in new tab</a>';
    };
    
    // Fallback timeout in case iframe doesn't trigger onload
    setTimeout(() => {
        if (loading.style.display !== 'none') {
            loading.style.display = 'none';
        }
    }, 5000);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
    const modal = document.getElementById('resumeModal');
    const iframe = document.getElementById('resumeIframe');
    const loading = document.querySelector('.iframe-loading');
    
    // Hide modal
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        iframe.src = ''; // Stop loading iframe
        loading.style.display = 'flex'; // Reset loading state
    }, 300);
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('resumeModal');
        if (modal && modal.classList.contains('active')) {
            closeResumeModal();
        }
    }
});

// Initialize particles
document.addEventListener('DOMContentLoaded', createParticles);