// GreenParking Zaventem - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-menu a').forEach(function(link) {
        link.addEventListener('click', function() {
            if (hamburger) hamburger.classList.remove('active');
            if (mobileMenu) mobileMenu.classList.remove('active');
            body.classList.remove('menu-open');
        });
    });

    // Sticky header shadow on scroll
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(function(question) {
        question.addEventListener('click', function() {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');

            // Close all other items in the same category
            const category = item.closest('.faq-category');
            if (category) {
                category.querySelectorAll('.faq-item.active').forEach(function(activeItem) {
                    if (activeItem !== item) {
                        activeItem.classList.remove('active');
                    }
                });
            }

            item.classList.toggle('active');
        });
    });

    // Date picker initialization
    const dateInputs = document.querySelectorAll('.date-input');
    dateInputs.forEach(function(input) {
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        input.setAttribute('min', today);

        // Add calendar icon click handler
        const wrapper = input.closest('.date-wrapper');
        if (wrapper) {
            const icon = wrapper.querySelector('.calendar-icon');
            if (icon) {
                icon.addEventListener('click', function() {
                    input.showPicker && input.showPicker();
                });
            }
        }
    });

    // Time select population
    document.querySelectorAll('.time-select').forEach(function(select) {
        if (select.options.length <= 1) {
            for (let h = 0; h < 24; h++) {
                for (let m = 0; m < 60; m += 30) {
                    const hour = h.toString().padStart(2, '0');
                    const min = m.toString().padStart(2, '0');
                    const option = document.createElement('option');
                    option.value = hour + ':' + min;
                    option.textContent = hour + ':' + min;
                    select.appendChild(option);
                }
            }
            // Default to 10:00
            select.value = '10:00';
        }
    });

    // Booking form submission
    const bookingForms = document.querySelectorAll('.booking-form');
    bookingForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const departDate = form.querySelector('[name="departure-date"]');
            const arriveDate = form.querySelector('[name="arrival-date"]');

            if (!departDate || !departDate.value) {
                alert('Selecteer een vertrekdatum');
                return;
            }
            if (!arriveDate || !arriveDate.value) {
                alert('Selecteer een aankomstdatum');
                return;
            }

            // Redirect to reservation page with dates
            const params = new URLSearchParams({
                departure: departDate.value,
                arrival: arriveDate.value,
                departTime: form.querySelector('[name="departure-time"]')?.value || '10:00',
                arriveTime: form.querySelector('[name="arrival-time"]')?.value || '10:00'
            });

            window.location.href = 'reserveren.html?' + params.toString();
        });
    });

    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = contactForm.querySelector('[name="name"]')?.value;
            const email = contactForm.querySelector('[name="email"]')?.value;
            const message = contactForm.querySelector('[name="message"]')?.value;

            if (!name || !email || !message) {
                alert('Vul alle verplichte velden in');
                return;
            }

            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'form-success';
            successMsg.textContent = 'Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.';
            contactForm.parentElement.insertBefore(successMsg, contactForm);
            contactForm.reset();

            setTimeout(function() {
                successMsg.remove();
            }, 5000);
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Scroll to top button
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(function(el) {
        observer.observe(el);
    });

    // Airport selector in footer
    const airportSelect = document.querySelector('.airport-select');
    if (airportSelect) {
        airportSelect.addEventListener('change', function() {
            if (this.value === 'schiphol') {
                window.location.href = 'https://greenparkingschiphol.nl';
            }
        });
    }

    // Pre-fill booking form from URL params (for reserveren page)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('departure')) {
        const depInput = document.querySelector('[name="departure-date"]');
        if (depInput) depInput.value = urlParams.get('departure');
    }
    if (urlParams.has('arrival')) {
        const arrInput = document.querySelector('[name="arrival-date"]');
        if (arrInput) arrInput.value = urlParams.get('arrival');
    }
    if (urlParams.has('departTime')) {
        const depTime = document.querySelector('[name="departure-time"]');
        if (depTime) depTime.value = urlParams.get('departTime');
    }
    if (urlParams.has('arriveTime')) {
        const arrTime = document.querySelector('[name="arrival-time"]');
        if (arrTime) arrTime.value = urlParams.get('arriveTime');
    }
});
