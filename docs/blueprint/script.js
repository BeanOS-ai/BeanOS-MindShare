/* ═══════════════════════════════════════════
   ACTIVE TOC HIGHLIGHTING
   ═══════════════════════════════════════════ */
(function() {
    'use strict';

    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = [];

    tocLinks.forEach(function(link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const target = document.getElementById(href.slice(1));
            if (target) sections.push({ el: target, link: link });
        }
    });

    let ticking = false;

    function updateActive() {
        const scrollY = window.scrollY + 120;
        let active = null;

        for (let i = sections.length - 1; i >= 0; i--) {
            if (sections[i].el.offsetTop <= scrollY) {
                active = sections[i];
                break;
            }
        }

        tocLinks.forEach(function(l) { l.classList.remove('active'); });
        if (active) active.link.classList.add('active');
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateActive);
            ticking = true;
        }
    });

    updateActive();
})();

/* ═══════════════════════════════════════════
   COPY-PASTABLE APPENDIX BLOCK
   ═══════════════════════════════════════════ */
(function() {
    'use strict';

    // Find the Appendix B heading — keep it and the intro paragraph rendered
    var heading = document.querySelector('[id^="appendix-b"]');
    if (!heading) return;

    // Walk siblings: h2 → p(em intro) → hr → p("Answer each question...") → ...
    // Keep h2 and intro paragraph rendered. Copy block starts from the "Answer" paragraph.
    var startEl = null;
    var el = heading.nextElementSibling;
    while (el) {
        if (el.tagName === 'P' && el.textContent.indexOf('Answer each question') === 0) {
            startEl = el;
            break;
        }
        el = el.nextElementSibling;
    }
    if (!startEl) return;

    // Remove the <hr> between intro and copy block
    var prevEl = startEl.previousElementSibling;
    if (prevEl && prevEl.tagName === 'HR') prevEl.remove();

    // Collect elements from startEl until the next h2 or end
    var elements = [];
    el = startEl;
    while (el) {
        // Stop before trailing <hr> + <h2> (License section)
        if (el.tagName === 'HR') {
            var afterHr = el.nextElementSibling;
            if (afterHr && afterHr.tagName === 'H2') break;
        }
        if (el.tagName === 'H2') break;
        elements.push(el);
        el = el.nextElementSibling;
    }

    if (elements.length === 0) return;

    // Extract plain text
    var textParts = [];
    elements.forEach(function(node) { textParts.push(node.innerText); });
    var plainText = textParts.join('\n\n');

    // Create the copy block
    var block = document.createElement('div');
    block.className = 'copy-block';
    block.textContent = plainText;

    // Create copy button (Flowbite-style)
    var copyIcon = '<svg viewBox="0 0 16 16"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25zM5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25z"/></svg>';
    var checkIcon = '<svg viewBox="0 0 16 16"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>';
    var btn = document.createElement('button');
    btn.className = 'copy-block-btn';
    btn.innerHTML = copyIcon + ' Copy';
    btn.addEventListener('click', function() {
        navigator.clipboard.writeText(plainText).then(function() {
            btn.innerHTML = checkIcon + ' Copied!';
            btn.classList.add('copied');
            setTimeout(function() {
                btn.innerHTML = copyIcon + ' Copy';
                btn.classList.remove('copied');
            }, 2000);
        });
    });

    block.prepend(btn);

    // Replace collected elements with the copy block
    var parent = startEl.parentNode;
    parent.insertBefore(block, startEl);
    elements.forEach(function(node) { parent.removeChild(node); });
})();

/* ═══════════════════════════════════════════
   MOBILE TOC
   ═══════════════════════════════════════════ */
(function() {
    'use strict';

    const toggle = document.getElementById('tocToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('open');
        overlay.style.display = 'block';
        requestAnimationFrame(function() { overlay.style.opacity = '1'; });
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.style.opacity = '0';
        setTimeout(function() {
            overlay.classList.remove('open');
            overlay.style.display = 'none';
        }, 300);
    }

    toggle.addEventListener('click', openSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Close sidebar on TOC link click (mobile)
    sidebar.querySelectorAll('.toc-link').forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 1024) closeSidebar();
        });
    });
})();
