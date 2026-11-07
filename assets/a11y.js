// Accessibility menu (תפריט נגישות) - shared by all pages.
// Settings are stored in this browser only (localStorage) and applied as classes on <html>.
(function () {
    var STORE_KEY = 'mitgalgelim-a11y';
    var FONT_STEPS = [100, 115, 130, 150];
    var TOGGLES = [
        { key: 'contrast', label: 'ניגודיות גבוהה', icon: 'fa-adjust' },
        { key: 'grayscale', label: 'גווני אפור', icon: 'fa-tint-slash' },
        { key: 'links', label: 'הדגשת קישורים', icon: 'fa-link' },
        { key: 'readable', label: 'גופן קריא', icon: 'fa-font' },
        { key: 'nomotion', label: 'עצירת אנימציות', icon: 'fa-pause-circle' },
        { key: 'cursor', label: 'סמן גדול', icon: 'fa-mouse-pointer' }
    ];
    var root = document.documentElement;
    var state = load();

    function load() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
    }
    function save() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    function apply() {
        root.style.fontSize = state.font ? FONT_STEPS[state.font] + '%' : '';
        TOGGLES.forEach(function (t) { root.classList.toggle('a11y-' + t.key, !!state[t.key]); });
        if (state.nomotion) {
            document.querySelectorAll('video').forEach(function (v) { v.pause(); });
            document.dispatchEvent(new CustomEvent('a11y:nomotion'));
        }
    }
    apply();

    // Links that open a new window: announce it to screen readers
    document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
        if (!a.rel) a.rel = 'noopener';
        var label = a.getAttribute('aria-label');
        if (label) { a.setAttribute('aria-label', label + ' (נפתח בחלון חדש)'); return; }
        var sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = ' (נפתח בחלון חדש)';
        a.appendChild(sr);
    });

    // ---- Widget ----
    var wrap = document.createElement('div');
    wrap.id = 'a11y-widget';
    wrap.innerHTML =
        '<button type="button" id="a11y-toggle" aria-expanded="false" aria-controls="a11y-panel" aria-label="תפריט נגישות">' +
            '<i class="fas fa-universal-access" aria-hidden="true"></i></button>' +
        '<div id="a11y-panel" role="dialog" aria-label="תפריט נגישות" hidden>' +
            '<div class="a11y-head"><h2>תפריט נגישות</h2>' +
            '<button type="button" class="a11y-close" aria-label="סגירת תפריט הנגישות">&times;</button></div>' +
            '<div class="a11y-font" role="group" aria-label="גודל טקסט">' +
                '<button type="button" data-font="1" aria-label="הגדלת טקסט"><i class="fas fa-search-plus" aria-hidden="true"></i> הגדלה</button>' +
                '<span class="a11y-font-val" aria-live="polite"></span>' +
                '<button type="button" data-font="-1" aria-label="הקטנת טקסט"><i class="fas fa-search-minus" aria-hidden="true"></i> הקטנה</button>' +
            '</div>' +
            '<div class="a11y-grid">' +
                TOGGLES.map(function (t) {
                    return '<button type="button" data-toggle="' + t.key + '" aria-pressed="false">' +
                        '<i class="fas ' + t.icon + '" aria-hidden="true"></i><span>' + t.label + '</span></button>';
                }).join('') +
            '</div>' +
            '<button type="button" class="a11y-reset"><i class="fas fa-undo" aria-hidden="true"></i> איפוס הגדרות</button>' +
            '<a class="a11y-statement" href="accessibility.html">הצהרת נגישות</a>' +
        '</div>';
    document.body.appendChild(wrap);

    var toggleBtn = wrap.querySelector('#a11y-toggle');
    var panel = wrap.querySelector('#a11y-panel');

    function refreshUI() {
        wrap.querySelector('.a11y-font-val').textContent = FONT_STEPS[state.font || 0] + '%';
        wrap.querySelectorAll('[data-toggle]').forEach(function (b) {
            b.setAttribute('aria-pressed', state[b.dataset.toggle] ? 'true' : 'false');
        });
    }
    refreshUI();

    function openPanel() {
        panel.hidden = false;
        toggleBtn.setAttribute('aria-expanded', 'true');
        panel.querySelector('.a11y-close').focus();
    }
    function closePanel(returnFocus) {
        panel.hidden = true;
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (returnFocus) toggleBtn.focus();
    }

    toggleBtn.addEventListener('click', function () { panel.hidden ? openPanel() : closePanel(false); });
    panel.querySelector('.a11y-close').addEventListener('click', function () { closePanel(true); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !panel.hidden) closePanel(true);
    });
    document.addEventListener('click', function (e) {
        if (!panel.hidden && !wrap.contains(e.target)) closePanel(false);
    });

    panel.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.font) {
            var f = (state.font || 0) + Number(b.dataset.font);
            state.font = Math.max(0, Math.min(FONT_STEPS.length - 1, f));
        } else if (b.dataset.toggle) {
            state[b.dataset.toggle] = !state[b.dataset.toggle];
            if (b.dataset.toggle === 'nomotion' && !state.nomotion) {
                document.dispatchEvent(new CustomEvent('a11y:motion'));
            }
        } else if (b.classList.contains('a11y-reset')) {
            var hadNoMotion = state.nomotion;
            state = {};
            try { localStorage.removeItem(STORE_KEY); } catch (err) {}
            apply(); refreshUI();
            if (hadNoMotion) document.dispatchEvent(new CustomEvent('a11y:motion'));
            return;
        } else {
            return;
        }
        save(); apply(); refreshUI();
    });
})();
