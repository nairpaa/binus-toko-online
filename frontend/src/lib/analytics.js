// Monitoring aktivitas pengguna: Google Analytics 4 dan/atau LogRocket.
// Keduanya opsional dan baru aktif kalau ID-nya diisi di environment variable:
//   VITE_GA_MEASUREMENT_ID  -> contoh G-ABC123XYZ
//   VITE_LOGROCKET_APP_ID   -> contoh abcdef/toko-online
// Kalau kosong (misalnya saat develop di lokal), semua fungsi di sini tidak melakukan apa-apa.

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const LOGROCKET_ID = import.meta.env.VITE_LOGROCKET_APP_ID;

let logRocketReady = null;

export function initMonitoring() {
  if (GA_ID) initGoogleAnalytics();
  if (LOGROCKET_ID) initLogRocket();
}

function initGoogleAnalytics() {
  // Ini potongan kode resmi gtag.js, cuma ditulis ulang supaya bisa diatur dari .env.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag memang butuh objek `arguments`, bukan array biasa.
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // page_view otomatis dimatikan. Di aplikasi React halaman tidak pernah reload,
  // jadi page_view dikirim manual setiap kali route berubah (lihat trackPageView).
  window.gtag('config', GA_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

function initLogRocket() {
  // Library LogRocket cukup besar, jadi baru diunduh kalau memang dipakai.
  logRocketReady = import('logrocket')
    .then(({ default: LogRocket }) => {
      LogRocket.init(LOGROCKET_ID, {
        network: {
          // LogRocket merekam request jaringan. Data rahasia disembunyikan dulu
          // supaya token dan password tidak ikut terkirim ke server LogRocket.
          requestSanitizer(request) {
            if (request.headers?.Authorization) request.headers.Authorization = '[disembunyikan]';
            if (request.url.includes('/api/auth/')) request.body = null;
            return request;
          },
          responseSanitizer(response) {
            if (response.url?.includes('/api/auth/')) response.body = null;
            return response;
          },
        },
      });
      return LogRocket;
    })
    .catch(() => null); // misalnya diblokir ad-blocker, aplikasi tetap jalan normal
}

function withLogRocket(callback) {
  logRocketReady?.then((LogRocket) => LogRocket && callback(LogRocket));
}

let lastTrackedPath = null;

export function trackPageView(path) {
  // Jangan catat halaman yang sama dua kali berturut-turut. Ini terjadi di mode development
  // karena React StrictMode sengaja menjalankan effect dua kali.
  if (path === lastTrackedPath) return;
  lastTrackedPath = path;

  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
  });
}

// Event yang namanya mengikuti "recommended events" GA4 (login, sign_up, search, view_item)
// otomatis dikenali dan punya laporan sendiri di dashboard.
export function trackEvent(name, params = {}) {
  window.gtag?.('event', name, params);
  withLogRocket((LogRocket) => LogRocket.track(name, params));
}

// Hubungkan aktivitas dengan akun yang sedang login.
// Ke Google Analytics cuma dikirim ID (aturan GA melarang mengirim email/nama).
export function setMonitoringUser(user) {
  window.gtag?.('set', { user_id: user ? String(user.id) : null });
  if (user) {
    withLogRocket((LogRocket) =>
      LogRocket.identify(String(user.id), { name: user.name, email: user.email, role: user.role })
    );
  }
}
