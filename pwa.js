/* ── Komal's Love World — PWA helper ── */

/* ── 1. Register service worker ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

/* ── 2. Check scheduled notifications ── */
const _shownThisSession = new Set();

async function _checkNotifications() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    // Always bypass cache so the latest notifications.json is used
    const res = await fetch('./notifications.json', { cache: 'no-store' });
    const { notifications } = await res.json();
    const now = Date.now();

    // Prefer service worker showNotification — required in standalone PWA mode
    const swReg = ('serviceWorker' in navigator)
      ? await navigator.serviceWorker.ready.catch(() => null)
      : null;

    for (const n of notifications) {
      if (_shownThisSession.has(n.id)) continue;
      const from  = n.showFrom  ? +new Date(n.showFrom)  : 0;
      const until = n.showUntil ? +new Date(n.showUntil) : Infinity;
      if (now < from || now > until) continue;
      _shownThisSession.add(n.id);

      setTimeout(async () => {
        const opts = {
          body:    n.body,
          icon:    n.icon    || './icons/icon.svg',
          badge:   './icons/icon.svg',
          tag:     n.tag     || n.id,
          vibrate: n.vibrate || [200, 100, 200],
          data:    { url: n.url || './' },
        };
        if (swReg) {
          // Works in background, standalone mode, and foreground
          await swReg.showNotification(n.title, opts);
        } else {
          // Fallback (desktop without SW)
          const notif = new Notification(n.title, opts);
          notif.onclick = () => {
            window.focus();
            if (n.url) window.location.href = n.url;
            notif.close();
          };
        }
      }, n.delayMs || 800);
    }
  } catch (e) {
    console.warn('[PWA] notification check failed:', e);
  }
}

/* ── 3. Permission banner ── */
function _showNotifBanner() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'denied') return;
  if (Notification.permission === 'granted') { _checkNotifications(); return; }
  if (localStorage.getItem('pwa-notif-asked')) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-notif-banner';
  banner.innerHTML = `
    <div style="font-family:'Nunito',Nunito,sans-serif;font-size:0.9rem;font-weight:700;color:#3d1a2e;margin-bottom:12px;line-height:1.5">
      🎂 Want a notification when your birthday surprises unlock?
    </div>
    <div style="display:flex;gap:10px;justify-content:center">
      <button id="pwa-notif-yes" style="
        background:linear-gradient(135deg,#ff7eb3,#ff3d7f);color:#fff;border:none;
        border-radius:50px;padding:9px 22px;
        font-family:'Nunito',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;
        box-shadow:0 4px 14px rgba(255,61,127,0.3);">Yes! 💕</button>
      <button id="pwa-notif-no" style="
        background:transparent;color:#a06080;
        border:2px solid rgba(160,96,128,0.3);border-radius:50px;padding:9px 18px;
        font-family:'Nunito',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;">Not now</button>
    </div>`;

  Object.assign(banner.style, {
    position: 'fixed', bottom: '24px', left: '50%',
    transform: 'translateX(-50%) translateY(120px)',
    background: '#fff', borderRadius: '22px', padding: '20px 22px',
    maxWidth: '340px', width: '90%',
    boxShadow: '0 14px 44px rgba(255,61,127,0.2), 0 2px 8px rgba(0,0,0,0.07)',
    border: '2px solid rgba(255,126,179,0.3)',
    zIndex: '8800', textAlign: 'center',
    transition: 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1)',
  });

  document.body.appendChild(banner);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      banner.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  function dismiss() {
    banner.style.transform = 'translateX(-50%) translateY(120px)';
    localStorage.setItem('pwa-notif-asked', '1');
    setTimeout(() => banner.remove(), 450);
  }

  document.getElementById('pwa-notif-yes').addEventListener('click', async () => {
    dismiss();
    const perm = await Notification.requestPermission();
    if (perm === 'granted') _checkNotifications();
  });

  document.getElementById('pwa-notif-no').addEventListener('click', dismiss);
}

/* Show banner 4s after page load — enough time for user to engage first */
setTimeout(_showNotifBanner, 4000);
