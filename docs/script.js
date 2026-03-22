/* ═══════════════════════════════════════════
   ACTIVE TOC HIGHLIGHTING
   ═══════════════════════════════════════════ */
(function() {
    'use strict';

    var tocLinks = document.querySelectorAll('.toc-link');
    var sections = [];

    tocLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            var target = document.getElementById(href.slice(1));
            if (target) sections.push({ el: target, link: link });
        }
    });

    var ticking = false;

    function updateActive() {
        var scrollY = window.scrollY + 120;
        var active = null;

        for (var i = sections.length - 1; i >= 0; i--) {
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
   MOBILE TOC
   ═══════════════════════════════════════════ */
(function() {
    'use strict';

    var toggle = document.getElementById('tocToggle');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');

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
