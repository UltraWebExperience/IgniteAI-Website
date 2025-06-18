document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const mascotBody = document.querySelector('.mascot-body');
    const aboutGraphicShapes = document.querySelectorAll('.about-graphic-shape');

    // Function to set the theme
    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            themeToggleBtn.textContent = '🌙'; // Moon icon for dark mode
            if (mascotBody) {
                mascotBody.setAttribute('fill', 'url(#aiGradientDark)'); // Change mascot color for dark theme
            }
            aboutGraphicShapes.forEach(el => { // Update About Us graphic color
                el.setAttribute('fill', 'url(#aboutGradientDark)');
            });
        } else {
            body.classList.remove('dark-theme');
            themeToggleBtn.textContent = '☀️'; // Sun icon for light mode
            if (mascotBody) {
                mascotBody.setAttribute('fill', 'url(#aiGradient)'); // Change mascot color back to light theme
            }
            aboutGraphicShapes.forEach(el => { // Update About Us graphic color
                el.setAttribute('fill', 'url(#aboutGradientLight)');
            });
        }
    }

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('igniteAiTheme'); // Unique key for this site's theme
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('light'); // Default to light if no theme saved
    }

    // Event listener for theme toggle button
    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            setTheme('light');
            localStorage.setItem('igniteAiTheme', 'light');
        } else {
            setTheme('dark');
            localStorage.setItem('igniteAiTheme', 'dark');
        }
    });

    // --- Typing Animation for Hero Text ---
    const typingTextElement = document.getElementById('typing-text');
    const phrases = [
        "Innovate. Automate. Scale.",
        "Your Partner in Digital Transformation.",
        "AI-Powered Solutions for Growth."
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            typingTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        let typingSpeed = 100; // Speed of typing
        if (isDeleting) {
            typingSpeed /= 2; // Faster deletion
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            typingSpeed = 1500; // Pause at end of phrase
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length; // Move to next phrase
            typingSpeed = 500; // Pause before typing new phrase
        }

        setTimeout(typeWriter, typingSpeed);
    }
    typeWriter(); // Start the typing animation

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('section, .feature-card, .solution-card, .about-text-content, .about-vision-graphic, .pricing-card, .testimonial-slide');

    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the element must be visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // --- Testimonial Carousel ---
    const slides = document.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.getElementById('testimonial-dots');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.transform = `translateX(-${index * 100}%)`;
        });
        updateDots(index);
    }

    function updateDots(index) {
        Array.from(dotsContainer.children).forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Auto-advance carousel
    setInterval(nextSlide, 5000); // Change slide every 5 seconds

    // Initial display
    showSlide(currentSlide);
    dotsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('carousel-dot')) {
            const slideIndex = parseInt(event.target.dataset.slideIndex);
            currentSlide = slideIndex;
            showSlide(currentSlide);
        }
    });
});
