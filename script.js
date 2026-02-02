document.addEventListener('DOMContentLoaded', function () {

    // Sticky Header
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.padding = '10px 0';
            nav.style.background = 'rgba(10, 25, 47, 0.9)';
        } else {
            nav.style.padding = '16px 0';
            nav.style.background = 'rgba(255, 255, 255, 0.05)';
        }
    });

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animation classes and observe
    const animatableElements = document.querySelectorAll('.glass-card, .hero-text, .hero-image, .solution-text, .stat-item, .demo-visual');
    animatableElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // Custom visible class for observer
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        </style>
    `);

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.menu');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            menu.classList.toggle('active');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                menu.classList.remove('active');
            });
        });
    }

    // Contact Form Logic
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;
            const fields = [
                { id: 'phone', msg: 'proszę o uzupełnienie' },
                { id: 'email', msg: 'proszę o uzupełnienie' },
                { id: 'subject', msg: 'proszę o uzupełnienie' }
            ];

            // Reset errors
            document.querySelectorAll('.form-group, .form-checkbox').forEach(el => el.classList.remove('error'));
            document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

            // Validate text fields
            fields.forEach(field => {
                const el = document.getElementById(field.id);
                const parent = el.closest('.form-group');
                const errorSpan = parent.querySelector('.error-msg');

                if (!el.value.trim()) {
                    parent.classList.add('error');
                    if (errorSpan) errorSpan.textContent = field.msg;
                    isValid = false;
                } else if (field.id === 'phone') {
                    const phoneRegex = /^[0-9+\s-()]{7,20}$/;
                    if (!phoneRegex.test(el.value.trim())) {
                        parent.classList.add('error');
                        if (errorSpan) errorSpan.textContent = 'Proszę podać poprawny numer telefonu';
                        isValid = false;
                    }
                } else if (field.id === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(el.value)) {
                        parent.classList.add('error');
                        if (errorSpan) errorSpan.textContent = 'Proszę podać poprawny adres e-mail';
                        isValid = false;
                    }
                }
            });

            // Validate consent
            const consent = document.getElementById('consent');
            const consentParent = consent.closest('.form-checkbox');
            const consentError = consentParent.querySelector('.error-msg');
            if (!consent.checked) {
                consentParent.classList.add('error');
                if (consentError) consentError.textContent = 'Proszę o wyrażenie zgody na przetwarzanie danych.';
                isValid = false;
            }

            if (!isValid) return;

            // Submit logic
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Wysyłanie...';

            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(async response => {
                    if (response.ok) {
                        this.style.display = 'none';
                        document.getElementById('form-success').style.display = 'block';
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.error('FormSubmit Error:', errorData);
                        throw new Error(errorData.message || 'Błąd serwera (status: ' + response.status + ')');
                    }
                })
                .catch(error => {
                    console.error('Submission Error:', error);
                    alert('Wystąpił błąd podczas wysyłania wiadomości: ' + error.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                });
        });
    }

    // Video Embedding Logic
    function initVideoInteraction() {
        const placeholder = document.getElementById('video-placeholder');
        const playDemoBtn = document.getElementById('play-demo-btn');
        const heroDemoBtn = document.getElementById('hero-demo-btn');

        function loadVideo() {
            if (!placeholder) return;
            // Don't reload if already playing
            if (placeholder.classList.contains('playing')) return;

            const videoId = placeholder.getAttribute('data-video-id');
            if (!videoId) return;

            // Create Iframe
            const iframe = document.createElement('iframe');
            iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`);
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            iframe.setAttribute('loading', 'lazy');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';

            // Clear placeholder and append iframe
            placeholder.innerHTML = '';
            placeholder.appendChild(iframe);
            placeholder.classList.add('playing');
        }

        if (placeholder) {
            placeholder.addEventListener('click', loadVideo);
        }

        [playDemoBtn, heroDemoBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    loadVideo();
                });
            }
        });
    }

    initVideoInteraction();

    console.log('%c RIVIO - System Ready', 'color: #00E5FF; font-weight: bold;');
});
