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

    // Video Embedding Logic (Lightbox)
    function initVideoInteraction() {
        const placeholder = document.getElementById('video-placeholder');
        const playDemoBtn = document.getElementById('play-demo-btn');
        const heroDemoBtn = document.getElementById('hero-demo-btn');
        const videoId = placeholder ? placeholder.getAttribute('data-video-id') : 'wNWU8549g08';

        function openLightbox() {
            // Create Overlay
            const overlay = document.createElement('div');
            overlay.className = 'video-modal-overlay';

            // Create Content Container
            const content = document.createElement('div');
            content.className = 'video-modal-content';

            // Create Close Button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'video-modal-close';
            closeBtn.innerHTML = '×';
            // Append close button to overlay (positioned relative to content via CSS, or append to container?)
            // CSS says .video-modal-close is absolute top -40px right 0 relative to content?
            // Actually it is often better to put close button INSIDE container or OUTSIDE.
            // Let's put it inside content but absolute positioned, wait.
            // CSS: .video-modal-content { position: relative; } .video-modal-close { position: absolute; top: -40px; }
            // So close button should be appended to content.
            content.appendChild(closeBtn);

            // Create Iframe
            const iframe = document.createElement('iframe');
            iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&vq=hd1080`);
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';

            content.appendChild(iframe);
            overlay.appendChild(content);
            document.body.appendChild(overlay);

            // Force reflow for transition
            setTimeout(() => {
                overlay.classList.add('active');
            }, 10);

            // Close Logic
            function closeLightbox() {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                }, 400);
            }

            closeBtn.addEventListener('click', closeLightbox);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeLightbox();
            });

            // ESC key
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    closeLightbox();
                    document.removeEventListener('keydown', escHandler);
                }
            });
        }

        if (placeholder) {
            placeholder.addEventListener('click', openLightbox);
        }

        // Hero Button - Only Scroll
        if (heroDemoBtn) {
            heroDemoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector('#video-player');
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 100, // Minimal scroll offset
                        behavior: 'smooth'
                    });
                }
            });
        }

        // Play Button in Qualification Section - Opens Lightbox
        if (playDemoBtn) {
            playDemoBtn.addEventListener('click', () => {
                openLightbox();
            });
        }
    }

    // Waitlist Modal Logic
    function initWaitlistModal() {
        const modal = document.getElementById('waitlist-modal');
        const openBtn = document.getElementById('open-waitlist-btn');
        const closeBtn = modal ? modal.querySelector('.close-modal') : null;
        const form = document.getElementById('waitlist-form');
        const successMsg = document.getElementById('waitlist-success');

        if (!modal || !openBtn) return;

        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        });

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const email = this.querySelector('input[type="email"]').value;
                const submitBtn = this.querySelector('button[type="submit"]');

                submitBtn.disabled = true;
                submitBtn.textContent = 'Zapisywanie...';

                fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email }),
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            this.style.display = 'none';
                            if (successMsg) successMsg.style.display = 'block';
                            console.log('Registered for waitlist:', email);
                        } else {
                            throw new Error(data.error || 'Błąd zapisu');
                        }
                    })
                    .catch(error => {
                        console.error('Waitlist Error:', error);
                        alert('Wystąpił błąd: ' + error.message);
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Zapisz mnie';
                    });
            });
        }
    }

    // FAQ Accordion
    function initFAQ() {
        const questions = document.querySelectorAll('.faq-question');
        questions.forEach(q => {
            q.addEventListener('click', () => {
                const item = q.parentElement;
                const answer = item.querySelector('.faq-answer');

                // Toggle active class
                item.classList.toggle('active');

                // Toggle max-height
                if (item.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = null;
                }
            });
        });
    }

    // Timeline Accordion
    function initTimelineAccordion() {
        const accordionItems = document.querySelectorAll('.timeline-accordion-item');

        accordionItems.forEach(item => {
            const header = item.querySelector('.step-header-wrap');
            if (header) {
                header.addEventListener('click', () => {

                    // Check if already active
                    const isActive = item.classList.contains('active');

                    // Collapse all
                    accordionItems.forEach(i => i.classList.remove('active'));

                    // If not active before, expand it
                    if (!isActive) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    initTimelineAccordion();
    initFAQ();
    initVideoInteraction();
    initWaitlistModal();

    console.log('%c RIVIO - System Ready', 'color: #00E5FF; font-weight: bold;');
});
