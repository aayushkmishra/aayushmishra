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
    // A blurred dust field gains nothing from a 2x framebuffer.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    // Create particles
    createParticleSystem();
    
    camera.position.z = 5;
    
    // Start animation loop
    animate();
}

// The accent as 0-1 floats, read live off the stylesheet so the field
// always matches whatever palette is loaded.
function accentRGB() {
    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-rgb')
        .split(',')
        .map(v => parseInt(v.trim(), 10) / 255);
    return raw.length === 3 && raw.every(v => !isNaN(v)) ? raw : [0.55, 0.6, 0.85];
}

function createParticleSystem() {
    const particleCount = window.innerWidth < 768 ? 90 : 190;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const [ar, ag, ab] = accentRGB();

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 10;
        positions[i + 1] = (Math.random() - 0.5) * 10;
        positions[i + 2] = (Math.random() - 0.5) * 10;
        
        const shade = 0.6 + Math.random() * 0.4;
        colors[i] = ar * shade;
        colors[i + 1] = ag * shade;
        colors[i + 2] = ab * shade;

        sizes[i / 3] = Math.random() * 1.8 + 0.6;
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
            // three.js injects the color attribute itself when
            // vertexColors is on. Declaring it again fails to compile,
            // which is why this field never used to render.
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (26.0 / -mvPosition.z) * (1.0 + sin(time + position.x) * 0.12);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                if (distanceToCenter > 0.5) discard;
                float alpha = 1.0 - smoothstep(0.1, 0.5, distanceToCenter);
                gl_FragColor = vec4(vColor, alpha * 0.85);
            }
        `,
        transparent: true,
        vertexColors: true,
        // A transparent material that still writes depth clips its
        // neighbours along the sprite quad, which is what put square
        // edges around overlapping particles.
        depthWrite: false,
        depthTest: false
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

const PARTICLE_FPS = 30;
let lastParticleFrame = 0;

function animate(now) {
    requestAnimationFrame(animate);
    if (!renderer || document.hidden) return;

    // Throttle to PARTICLE_FPS rather than the display refresh rate.
    if (now - lastParticleFrame < 1000 / PARTICLE_FPS) return;
    lastParticleFrame = now;

    const time = now * 0.001;

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

// Navbar state on scroll. Passive, and the element is looked up once.
const navbarEl = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (navbarEl) navbarEl.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

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
            const children = entry.target.querySelectorAll('.project-card, .work-card, .skill-item, .skill-category, .experience-item, .about-highlights .highlight');
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
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0) scale(1)';
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
    document.querySelectorAll('.project-card, .work-card').forEach(card => {
        card.addEventListener('mousedown', () => {
            card.style.transform = 'translateY(1px)';
        });
        
        card.addEventListener('mouseup', () => {
            card.style.transform = '';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ===== IMPACT COUNTERS =====
function initMetricCounters() {
    const counters = document.querySelectorAll('.metric-counter');
    if (!counters.length) return;

    const formatMetric = (value, counter) => {
        const prefix = counter.dataset.prefix || '';
        const suffix = counter.dataset.suffix || '';
        const displayValue = value >= 1000 ? value.toLocaleString('en-US') : value;
        return `${prefix}${displayValue}${suffix}`;
    };

    const runCounter = (counter) => {
        const target = Number(counter.dataset.target || 0);
        const duration = 1300;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * eased);
            counter.textContent = formatMetric(value, counter);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                counter.textContent = formatMetric(target, counter);
            }
        }

        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                runCounter(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(counter => observer.observe(counter));
}

// ===== SKILL FILTERS =====
function initSkillFilters() {
    const filterButtons = document.querySelectorAll('.skill-filter');
    const skillRows = document.querySelectorAll('.skill-row[data-category]');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            filterButtons.forEach(item => item.classList.remove('active'));
            button.classList.add('active');

            skillRows.forEach(row => {
                const shouldShow = filter === 'all' || row.dataset.category === filter;
                row.classList.toggle('is-hidden', !shouldShow);
            });
        });
    });
}

// ===== CASE STUDY MODAL =====
const caseStudies = {
    referral: {
        icon: 'fas fa-file-medical-alt',
        label: 'Healthcare AI',
        title: 'Referral Extraction System',
        summary: 'A document intelligence workflow that auto-reads faxes, emails, and manual uploads, then uses Gemini OCR and Bedrock-backed LLM extraction to create editable structured referral metadata.',
        flowImage: 'assets/case-studies/referral-system-hld.gif',
        flowAlt: 'Animated HLD diagram for referral extraction across intake, orchestration, AI extraction, storage and review, and downstream DAG stages.',
        problems: [
            'Referral inputs arrive from faxes, emails, and manual uploads in scanned or image-heavy formats.',
            'Extracted fields need enrichment from other systems before they are useful downstream.',
            'Teams need automation while keeping the populated metadata manually editable and reviewable.'
        ],
        technical: [
            'SQS-backed queueing layer orchestrates retryable extraction jobs and writeback processing.',
            'Gemini OCR and Bedrock-backed LLM extraction parse scanned documents and populate structured metadata.',
            'Cosmos DB stores extracted and enriched metadata, with Redis-backed lookup paths and Kafka/event hooks for downstream workflow handoff.'
        ],
        impact: 'Creates an automation-ready referral backbone that can feed benefit verification, prior authorization, provider/patient communication, fax workflows, and Twilio-based autonomous call flows.'
    },
    'agentic-ingestion': {
        icon: 'fas fa-route',
        label: 'Data Platform',
        title: 'Agentic Ingestion Orchestration',
        summary: 'An incremental ingestion and pattern-detection workflow that discovers new landing files, clusters incoming datasets, validates schema quality, and routes patterns through human accept/reject review.',
        flowImage: 'assets/case-studies/agentic-ingestion-hld.gif',
        flowAlt: 'Animated HLD diagram for agentic ingestion orchestration across AWS Athena discovery, SQS, Kubernetes Scala workers, MongoDB, Redis, LLM-assisted pattern inference, decision paths, and review experience.',
        problems: [
            'Incremental landing files need safe discovery across folders, connector paths, and file formats.',
            'Dataset pattern recommendations must avoid grouping unrelated files or low-confidence clusters.',
            'Users need a review flow that can accept a pattern into a dataset or reject it cleanly.'
        ],
        technical: [
            'AWS/Athena metadata fetches feed SQS workers that process connector paths incrementally.',
            'Scala clustering analyzes folder paths, partitions, lexical filename features, schemas, and file formats.',
            'MongoDB tracks job executions, identified patterns, epochs, and accept/reject state used by the Pattern UI and FileExplorer.'
        ],
        impact: 'Turns raw landing-zone activity into governed dataset recommendations with validation, confidence checks, and a clear human-in-the-loop creation path.'
    },
    lakehouse: {
        icon: 'fas fa-layer-group',
        label: 'Lakehouse Engineering',
        title: 'Snowflake to Databricks Expansion',
        summary: 'Extended Snowflake-first Scala and Python pipelines to Databricks with governed writes, Unity Catalog integration, and schema safeguards.',
        flowImage: 'assets/case-studies/lakehouse-hld.gif',
        flowAlt: 'Animated HLD diagram for Snowflake to Databricks expansion with service principal authentication, Unity Catalog, external locations, manual date format mapping, strict casting, and governed lakehouse writes.',
        problems: [
            'Existing pipelines needed Databricks support without weakening governance.',
            'Databricks enforced stricter ISO date handling than Snowflake, requiring a manual date-format mapping layer in Scala.',
            'Cloud storage destinations needed safer incremental archive and destination flows.'
        ],
        technical: [
            'Service-principal authentication with PAT fallback.',
            'Unity Catalog, metastore-aware writes, external locations, and governed table operations.',
            'Manual date-field mapping plus strict casting and schema validation.'
        ],
        impact: 'Enabled broader lakehouse execution while preserving reliable, resumable ingestion across S3 and ADLS flows.'
    },
    analytics: {
        icon: 'fas fa-chart-line',
        label: 'Product Analytics',
        title: 'Healthcare Analytics Dashboard',
        summary: 'A data-intensive dashboard experience for healthcare and senior-living workflows with drilldowns, optimized queries, and quality monitoring.',
        flowHeading: 'Product Screens',
        flowMeta: 'Redacted client data',
        galleryImages: [
            { src: 'assets/analytics/analytics-pulse-overview.png', alt: 'Redacted analytics dashboard pulse overview with KPI cards and process flow charts.' },
            { src: 'assets/analytics/analytics-distribution.png', alt: 'Redacted analytics dashboard distribution view with trend charts and status breakdowns.' },
            { src: 'assets/analytics/analytics-agents.png', alt: 'Redacted analytics dashboard agents view with extraction accuracy and channel breakdown charts.' },
            { src: 'assets/analytics/analytics-location-detail.png', alt: 'Redacted analytics dashboard location drilldown drawer.' },
            { src: 'assets/analytics/analytics-intake-detail.png', alt: 'Redacted analytics dashboard intake outcomes drilldown drawer.' }
        ],
        problems: [
            'Operational teams need high-signal dashboards over complex healthcare data.',
            'Analytics screens must stay useful under repeated filtering and drilldown use.',
            'Data quality signals need to be visible inside normal product workflows.'
        ],
        technical: [
            '30+ chart visualizations with interactive drilldowns.',
            'React and TypeScript product surfaces backed by optimized queries.',
            'Cosmos DB, Redis caching, Azure workflows, and data-quality monitoring.'
        ],
        impact: 'Improved visibility into healthcare workflows and gave teams faster ways to inspect trends, anomalies, and data quality.'
    },
    scorecard: {
        icon: 'fas fa-tachometer-alt',
        label: 'Enterprise Scorecards',
        title: 'DAG-Based Scorecard Platform',
        summary: 'A production-grade scorecard system that connected DAG-based data ingestion, ML downtime prediction, backend APIs, and Angular/Kendo UI dashboards into a scalable enterprise product.',
        flowImage: 'assets/case-studies/scorecard-hld.gif',
        flowAlt: 'Animated HLD diagram for a DAG-based scorecard platform from client system aggregation through DAG metrics, scorecard outputs, PDF reports, and analytics dashboards.',
        problems: [
            'Operational scorecards needed reliable ingestion from multiple data sources into production dashboards.',
            'Teams needed predictive signals around downtime instead of only retrospective reporting.',
            'The frontend had to support dense enterprise workflows while staying usable for client-facing scorecard review.'
        ],
        technical: [
            'Designed DAG-based ingestion flows that moved data into production-grade dashboard and scorecard layers.',
            'Built Python services with Django and FastAPI for backend APIs, orchestration, and product workflows.',
            'Integrated ML prediction models for downtime prediction and surfaced outputs through Angular and Kendo UI.'
        ],
        impact: 'Scaled the system for enterprise usage across client scorecard workflows, contributing to approximately $70M in annual revenue impact.'
    }
};

let activeCaseStudyGallery = [];
let activeCaseStudyGalleryIndex = 0;

function initCaseStudies() {
    document.querySelectorAll('[data-case-study]').forEach(card => {
        card.addEventListener('click', () => openCaseStudy(card.dataset.caseStudy));
    });

    document.getElementById('caseStudyGalleryPrev')?.addEventListener('click', () => {
        showCaseStudyGalleryImage(activeCaseStudyGalleryIndex - 1);
    });

    document.getElementById('caseStudyGalleryNext')?.addEventListener('click', () => {
        showCaseStudyGalleryImage(activeCaseStudyGalleryIndex + 1);
    });
}

function showCaseStudyGalleryImage(index) {
    const flowImage = document.getElementById('caseStudyFlowImage');
    const status = document.getElementById('caseStudyGalleryStatus');
    const dots = document.getElementById('caseStudyGalleryDots');
    if (!flowImage || !activeCaseStudyGallery.length) return;

    const total = activeCaseStudyGallery.length;
    activeCaseStudyGalleryIndex = (index + total) % total;
    const item = activeCaseStudyGallery[activeCaseStudyGalleryIndex];
    flowImage.src = item.src;
    flowImage.alt = item.alt;
    if (status) status.textContent = `${activeCaseStudyGalleryIndex + 1} / ${total}`;

    // Dots are built once per case study, then only their state changes.
    if (dots) {
        if (dots.children.length !== total) {
            dots.innerHTML = '';
            activeCaseStudyGallery.forEach((img, i) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'gallery-dot';
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', `Screen ${i + 1} of ${total}`);
                dot.addEventListener('click', () => showCaseStudyGalleryImage(i));
                dots.appendChild(dot);
            });
        }
        [...dots.children].forEach((dot, i) => {
            const on = i === activeCaseStudyGalleryIndex;
            dot.classList.toggle('is-active', on);
            dot.setAttribute('aria-selected', String(on));
        });
    }
}

function openCaseStudy(key) {
    const data = caseStudies[key];
    const modal = document.getElementById('caseStudyModal');
    if (!data || !modal) return;

    document.getElementById('caseStudyIcon').innerHTML = `<i class="${data.icon}"></i>`;
    document.getElementById('caseStudyLabel').textContent = data.label;
    document.getElementById('caseStudyTitle').textContent = data.title;
    document.getElementById('caseStudySummary').textContent = data.summary;
    document.getElementById('caseStudyProblems').innerHTML = data.problems.map(item => `<li>${item}</li>`).join('');
    document.getElementById('caseStudyTechnical').innerHTML = data.technical.map(item => `<li>${item}</li>`).join('');
    document.getElementById('caseStudyImpact').textContent = data.impact;

    const flow = document.getElementById('caseStudyFlow');
    const flowImage = document.getElementById('caseStudyFlowImage');
    const flowHeading = document.getElementById('caseStudyFlowHeading');
    const flowMeta = document.getElementById('caseStudyFlowMeta');
    const galleryControls = document.getElementById('caseStudyGalleryControls');
    if (flow && flowImage && flowHeading && flowMeta && galleryControls) {
        activeCaseStudyGallery = data.galleryImages || [];
        activeCaseStudyGalleryIndex = 0;

        if (activeCaseStudyGallery.length) {
            flow.hidden = false;
            galleryControls.hidden = activeCaseStudyGallery.length <= 1;
            flowHeading.textContent = data.flowHeading || 'Product Screens';
            flowMeta.textContent = data.flowMeta || 'Loaded on demand';
            showCaseStudyGalleryImage(0);
        } else if (data.flowImage) {
            flow.hidden = false;
            galleryControls.hidden = true;
            flowHeading.textContent = data.flowHeading || 'Architecture Flow';
            flowMeta.textContent = data.flowMeta || 'Loaded on demand';
            flowImage.src = data.flowImage;
            flowImage.alt = data.flowAlt || `${data.title} architecture flow`;
        } else {
            flow.hidden = true;
            galleryControls.hidden = true;
            flowImage.removeAttribute('src');
            flowImage.alt = '';
        }
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

function closeCaseStudy() {
    const modal = document.getElementById('caseStudyModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
        modal.style.display = 'none';
        const flowImage = document.getElementById('caseStudyFlowImage');
        if (flowImage) flowImage.removeAttribute('src');
        activeCaseStudyGallery = [];
        activeCaseStudyGalleryIndex = 0;
    }, 300);
    document.body.style.overflow = 'auto';
}

// ===== CERTIFICATION CREDENTIAL VIEWER =====
function initCredentialCards() {
    document.querySelectorAll('.cert-card').forEach(card => {
        const link = card.querySelector('.cert-link');
        if (!link) return;

        card.addEventListener('click', () => {
            openCredentialModal(card, link.href);
        });

        link.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openCredentialModal(card, link.href);
        });
    });
}

function initCredentialOpenLink() {
    const openLink = document.getElementById('credentialOpenLink');
    if (!openLink) return;

    openLink.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (openLink.href && openLink.href !== '#') {
            window.open(openLink.href, '_blank', 'noopener,noreferrer');
        }
    });
}

function openCredentialModal(card, url) {
    const modal = document.getElementById('credentialModal');
    const preview = modal?.querySelector('.credential-preview');
    const previewImage = document.getElementById('credentialPreviewImage');
    const previewMeta = document.getElementById('credentialPreviewMeta');
    const previewDescription = document.getElementById('credentialPreviewDescription');
    const title = document.getElementById('credentialTitle');
    const issuer = document.getElementById('credentialIssuer');
    const openLink = document.getElementById('credentialOpenLink');

    if (!modal || !preview || !previewImage || !previewMeta || !previewDescription || !title || !issuer || !openLink) return;

    title.textContent = card.querySelector('h3')?.textContent || 'Credential';
    issuer.textContent = card.querySelector('.cert-org')?.textContent || 'Certification';
    previewMeta.textContent = card.querySelector('.cert-org')?.textContent || 'Certification';
    previewDescription.textContent = card.querySelector('.cert-meta')?.textContent || 'Credential details';

    if (card.dataset.previewImage) {
        preview.classList.remove('no-image');
        previewImage.style.display = '';
        previewImage.src = card.dataset.previewImage;
        previewImage.alt = `${title.textContent} credential preview`;
    } else {
        preview.classList.add('no-image');
        previewImage.removeAttribute('src');
        previewImage.alt = '';
        previewImage.style.display = 'none';
        previewDescription.textContent = 'Credential image pending. Use Open source to verify this credential on the issuer website.';
    }

    openLink.href = url;

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

function closeCredentialModal() {
    const modal = document.getElementById('credentialModal');
    const previewImage = document.getElementById('credentialPreviewImage');
    if (!modal || !previewImage) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
        modal.style.display = 'none';
        previewImage.src = '';
        previewImage.style.display = '';
    }, 300);
    document.body.style.overflow = 'auto';
}

// Smooth reveal animation for elements
// Reveal is handled by enhancedObserver (IntersectionObserver). A
// scroll-driven version used to run alongside it, calling
// getBoundingClientRect() on every .reveal element per scroll event.

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
// Floating shapes are animated by the CSS `float-around` keyframes.
// A JS rAF loop used to write inline transforms over the top of them,
// which beat the stylesheet and forced an uncomposited paint per frame.

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
    updateParticleColors();
    
    // Trigger theme change event for other components
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
    
    console.log(`🎨 Theme switched to: ${theme}`);
}

function updateParticleColors() {
    if (!particles || !particles.geometry) return;

    const [ar, ag, ab] = accentRGB();
    const colors = particles.geometry.attributes.color;
    const a = colors.array;

    for (let i = 0; i < a.length; i += 3) {
        const shade = 0.6 + Math.random() * 0.4;
        a[i] = ar * shade;
        a[i + 1] = ag * shade;
        a[i + 2] = ab * shade;
    }

    colors.needsUpdate = true;
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
        
    });
}

// ===== SCROLL SPY =====
// Marks the nav link for whichever section is currently in view. Uses the
// midpoint of the viewport rather than the top edge, so the highlight
// changes when a section actually dominates the screen.
function initScrollSpy() {
    const links = [...document.querySelectorAll('.nav-link')];
    // Sorted by position on the page, not by order in the markup. Walking
    // them in nav order and keeping the last match means an out-of-order
    // link silently overwrites the correct answer.
    const targets = links
        .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
        .filter(entry => entry.section)
        .sort((a, b) => a.section.offsetTop - b.section.offsetTop);
    if (!targets.length) return;

    let ticking = false;
    const update = () => {
        ticking = false;
        const line = window.scrollY + window.innerHeight * 0.4;
        let current = null;
        targets.forEach(entry => {
            if (entry.section.offsetTop <= line) current = entry;
        });
        targets.forEach(entry => {
            const on = entry === current;
            entry.link.classList.toggle('is-current', on);
            if (on) {
                entry.link.setAttribute('aria-current', 'true');
            } else {
                entry.link.removeAttribute('aria-current');
            }
        });
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });
    update();
}

// Scroll progress indicator
function addScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--accent-primary);
        z-index: 9999;
        transform: scaleX(0);
        transform-origin: 0 50%;
    `;
    
    document.body.appendChild(progressBar);
    
    let progressQueued = false;
    window.addEventListener('scroll', () => {
        if (progressQueued) return;
        progressQueued = true;
        requestAnimationFrame(() => {
            progressQueued = false;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? window.pageYOffset / docHeight : 0;
            progressBar.style.transform = 'scaleX(' + pct + ')';
        });
    }, { passive: true });
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
    
    // Animate floating shapes
    
    // Add section transitions
    addSectionTransitions();
    
    // Initialize contact form animations
    animateContactForm();
    
    // Initialize project card effects
    initProjectCardEffects();

    // Initialize portfolio content interactions
    initMetricCounters();
    initSkillFilters();
    initCaseStudies();
    initCredentialCards();
    initCredentialOpenLink();
    initScrollSpy();

    // Publish the bar's height so the mobile panel can anchor to it rather
    // than to a hardcoded 70px that stops being true once it contracts.
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        // Always the RESTING height, never the contracted one: layout
        // reserves space against this, so it has to be stable while
        // scrolling. Measured with the scrolled state briefly off.
        const publishNavHeight = () => {
            const wasScrolled = navbar.classList.contains('is-scrolled');
            if (wasScrolled) navbar.classList.remove('is-scrolled');
            document.documentElement.style
                .setProperty('--nav-h', navbar.offsetHeight + 'px');
            if (wasScrolled) navbar.classList.add('is-scrolled');
        };
        publishNavHeight();
        window.addEventListener('resize', publishNavHeight);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(publishNavHeight);
        }
    }
    
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
            background: rgba(var(--accent-rgb), 0.28);
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
    const fileId = config.resumeFileId;
    const resumeEmbedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    
    // Set download link
    document.getElementById('downloadBtn').href = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
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
    const csModal = document.getElementById('caseStudyModal');
    if (csModal && csModal.classList.contains('active') && activeCaseStudyGallery.length > 1) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            showCaseStudyGalleryImage(activeCaseStudyGalleryIndex - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            showCaseStudyGalleryImage(activeCaseStudyGalleryIndex + 1);
        }
    }

    if (e.key === 'Escape') {
        const modal = document.getElementById('resumeModal');
        if (modal && modal.classList.contains('active')) {
            closeResumeModal();
        }
        const caseStudyModal = document.getElementById('caseStudyModal');
        if (caseStudyModal && caseStudyModal.classList.contains('active')) {
            closeCaseStudy();
        }
        const credentialModal = document.getElementById('credentialModal');
        if (credentialModal && credentialModal.classList.contains('active')) {
            closeCredentialModal();
        }
    }
});

// Initialize particles
document.addEventListener('DOMContentLoaded', createParticles);
