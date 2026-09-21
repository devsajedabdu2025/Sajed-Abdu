/* =====================================================
   سكربت الموقع الشخصي
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1) الوضع الليلي / النهاري ---------- */
    document.getElementById('themeToggle').addEventListener('click', () => {
        const next = root.dataset.theme === 'light' ? 'dark' : 'light';
        root.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch (e) {}
    });

    /* ---------- 2) قائمة الجوال ---------- */
    const nav = document.getElementById('nav');
    const menuToggle = document.getElementById('menuToggle');

    const setMenu = (open) => {
        nav.classList.toggle('open', open);
        menuToggle.setAttribute('aria-expanded', open);
        menuToggle.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    };

    menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target)) setMenu(false);
    });

    /* ---------- 3) الهيدر وزر العودة للأعلى عند التمرير ---------- */
    const header = document.getElementById('header');
    const backToTop = document.getElementById('backToTop');

    const onScroll = () => {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 20);
        backToTop.classList.toggle('show', y > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener('click', () => window.scrollTo({ top: 0 }));

    /* ---------- 4) تمييز رابط القسم الحالي ---------- */
    const navLinks = document.querySelectorAll('.nav-link');
    const sectionSpy = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('main section[id]').forEach(section => sectionSpy.observe(section));

    /* ---------- 5) تأثير الكتابة في المسمى الوظيفي ---------- */
    const typed = document.querySelector('.typed');
    if (typed) {
        const words = JSON.parse(typed.dataset.words);
        let wordIndex = 0;
        let charIndex = words[0].length;
        let deleting = true;

        const type = () => {
            const word = words[wordIndex];
            charIndex += deleting ? -1 : 1;
            typed.textContent = word.slice(0, charIndex);

            let delay = deleting ? 40 : 90;
            if (!deleting && charIndex === word.length) {
                deleting = true;
                delay = 2000;
            } else if (deleting && charIndex === 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                delay = 400;
            }
            setTimeout(type, delay);
        };
        setTimeout(type, 2200);
    }

    /* ---------- 6) عدّاد الأرقام ---------- */
    const animateCounter = (el) => {
        const target = Number(el.dataset.target);

        const duration = 1600;
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    /* ---------- 7) ظهور العناصر عند التمرير ---------- */
    const revealElement = (el) => {
        el.classList.add('visible');
        el.querySelectorAll('.skill-fill').forEach(bar => { bar.style.width = bar.dataset.level + '%'; });
        el.querySelectorAll('.counter').forEach(animateCounter);

        // بعد انتهاء الحركة نزيل الكلاس حتى تعود حركات hover الخاصة بالعنصر
        el.addEventListener('transitionend', function cleanup(e) {
            if (e.target !== el || e.propertyName !== 'opacity') return;
            el.classList.remove('reveal', 'visible');
            el.style.removeProperty('--delay');
            el.removeEventListener('transitionend', cleanup);
        });
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            revealElement(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ---------- 8) فلترة المشاريع ---------- */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            const filter = button.dataset.filter;
            projectCards.forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('hide', !match);
                if (match) {
                    card.classList.remove('pop');
                    void card.offsetWidth; // لإعادة تشغيل الحركة
                    card.classList.add('pop');
                }
            });
        });
    });

    /* ---------- 9) توهج بطاقات الخدمات مع الماوس ---------- */
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
            card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        });
    });

    /* ---------- 9.5) ميلان الصورة الشخصية ثلاثي الأبعاد مع الماوس ---------- */
    const heroVisual = document.querySelector('.hero-visual');
    const avatar = document.querySelector('.avatar');
    if (heroVisual && avatar && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
        heroVisual.addEventListener('pointermove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            avatar.style.transform = `perspective(900px) rotateX(${-y * 16}deg) rotateY(${x * 16}deg)`;
        });
        heroVisual.addEventListener('pointerleave', () => {
            avatar.style.transform = '';
        });
    }

    /* ---------- 10) نموذج التواصل ---------- */
    const form = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
    let toastTimer;

    const showToast = (message, isError = false) => {
        toast.textContent = message;
        toast.classList.toggle('error', isError);
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 6000);
    };

    // يأخذ بريدك من رابط البريد في قسم التواصل — الرسائل تصل إليه عبر خدمة FormSubmit المجانية
    const emailLink = document.querySelector('.contact-item[href^="mailto:"]');
    const myEmail = emailLink.getAttribute('href').replace('mailto:', '');
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitBtnHTML = submitBtn.innerHTML;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));

        // البرامج الآلية تملأ الحقل المخفي: نتجاهلها بصمت
        if (data._honey) {
            form.reset();
            return;
        }

        // FormSubmit لا يعمل عند فتح الملف مباشرة من الجهاز
        if (location.protocol === 'file:') {
            showToast('⚠️ Open the site from a web server (e.g. VS Code Live Server) to send messages.', true);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-circle-notch fa-spin"></i>';

        try {
            const response = await fetch(`https://formsubmit.co/ajax/${myEmail}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    message: data.message,
                    _subject: data.subject ? `Portfolio: ${data.subject}` : `New message from ${data.name}`,
                    _replyto: data.email,
                    _template: 'table',
                    _captcha: 'false'
                })
            });
            const result = await response.json();

            if (response.ok && String(result.success) === 'true') {
                showToast("✅ Thanks! Your message has been sent — I'll get back to you soon.");
                form.reset();
            } else if (/activat/i.test(result.message || '')) {
                // أول مرة فقط: FormSubmit يرسل لك إيميل تفعيل
                showToast(`📩 Almost ready! Check ${myEmail} and click "Activate Form", then send again.`, true);
            } else {
                throw new Error(result.message || 'Request failed');
            }
        } catch (error) {
            console.error(error);
            showToast(`❌ Couldn't send your message. Please try again or email ${myEmail}.`, true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtnHTML;
        }
    });

    /* ---------- 11) سنة حقوق النشر ---------- */
    document.getElementById('year').textContent = new Date().getFullYear();
});
