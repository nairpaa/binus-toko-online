# Monitoring: Google Analytics & LogRocket

TokoKita bisa memakai **Google Analytics 4** (statistik pengunjung), **LogRocket** (rekaman sesi seperti
video), atau **keduanya sekaligus**. Semua kodenya ada di satu file: `frontend/src/lib/analytics.js`.

Monitoring hanya aktif kalau ID-nya diisi di environment variable. Saat develop di lokal biasanya dibiarkan
kosong, supaya kunjunganmu sendiri tidak mengotori data.

| Variabel | Untuk | Contoh |
| --- | --- | --- |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 | `G-ABC123XYZ9` |
| `VITE_LOGROCKET_APP_ID` | LogRocket | `abcdef/toko-online` |

## Google Analytics 4

### Setup

1. Buka <https://analytics.google.com> → **Admin** (ikon gerigi) → **Create → Property**.
   Isi nama `TokoKita`, zona waktu **Indonesia**, mata uang **Rupiah (IDR)**.
2. Pilih platform **Web**, lalu isi URL frontend dari Vercel/Netlify (misalnya `https://toko-online-abc.vercel.app`).
3. Salin **Measurement ID** (`G-XXXXXXXXXX`).
4. Di dashboard Vercel: **Project → Settings → Environment Variables** → tambahkan
   `VITE_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX` → **Redeploy**.

### Cara mengecek

- **Reports → Realtime**: buka situsnya di tab lain, kunjunganmu muncul dalam beberapa detik.
- **Admin → DebugView**: menampilkan setiap event secara detail. Untuk mengaktifkannya, pasang ekstensi
  Chrome *Google Analytics Debugger*.
- Laporan harian (**Reports → Engagement → Events / Pages and screens**) baru terisi sekitar 24-48 jam kemudian.

### Event yang dikirim

| Event | Kapan | Parameter | Kode |
| --- | --- | --- | --- |
| `page_view` | Setiap pindah halaman | `page_path`, `page_location` | `components/Layout.jsx` |
| `sign_up` | Registrasi berhasil | `method: email` | `context/AuthContext.jsx` |
| `login` | Login berhasil | `method: email` | `context/AuthContext.jsx` |
| `logout` | Klik Keluar | - | `context/AuthContext.jsx` |
| `logout_all_devices` | Keluar dari semua perangkat | `sessions` | `context/AuthContext.jsx` |
| `search` | Berhenti mengetik di kolom cari selama 1 detik | `search_term` | `pages/ProductList.jsx` |
| `view_item` | Membuka detail produk | `currency`, `value`, `items[]` | `pages/ProductDetail.jsx` |

`login`, `sign_up`, `search`, dan `view_item` adalah *recommended events* GA4, jadi otomatis dikenali dan
masuk laporan bawaan. Contohnya, produk yang paling sering dilihat muncul di **Reports → Monetization → E-commerce purchases**
(kolom *Items viewed*).

Kenapa `page_view` dikirim manual? Aplikasi React tidak pernah benar-benar reload halaman (SPA). Kalau
mengandalkan pengiriman otomatis GA, hanya halaman pertama yang tercatat. Karena itu `send_page_view`
dimatikan dan `Layout.jsx` mengirim `page_view` setiap kali route React Router berubah.

### Privasi

Ke Google Analytics hanya dikirim **ID akun** (`user_id`) untuk pengunjung yang login. Nama dan email tidak
pernah dikirim, karena aturan Google Analytics melarang mengirim data pribadi.

## LogRocket

LogRocket merekam apa yang dilakukan pengunjung (klik, scroll, pindah halaman, error JavaScript, request
jaringan) lalu memutarnya ulang seperti video. Berguna untuk mencari tahu kenapa pengguna gagal di suatu langkah.

### Setup

1. Daftar di <https://logrocket.com> (ada paket gratis dengan kuota sesi per bulan).
2. Buat project baru, lalu salin **App ID** di **Settings → General Settings** (formatnya `abcdef/nama-project`).
3. Di Vercel: tambahkan `VITE_LOGROCKET_APP_ID` → **Redeploy**.
4. Buka situsnya, klik-klik sebentar, lalu lihat dashboard LogRocket → **Sessions**.

### Yang tercatat

- Rekaman sesi dan semua event dari tabel di atas (lewat `LogRocket.track`).
- Pengunjung yang login dikenali dengan nama, email, dan role (`LogRocket.identify`), jadi sesi bisa dicari per orang.

### Data rahasia yang disembunyikan

Diatur di `initLogRocket()`:

- Header `Authorization` (access token) diganti `[disembunyikan]`.
- Isi request **dan** response semua endpoint `/api/auth/*` dibuang, jadi password dan token tidak ikut terkirim.
- Kolom `<input type="password">` otomatis disamarkan oleh LogRocket.

Library LogRocket cukup besar, jadi baru diunduh (`import()` dinamis) kalau `VITE_LOGROCKET_APP_ID` diisi.
Kalau kosong, kodenya bahkan tidak ikut masuk hasil build.

## Content Security Policy

Frontend production memasang CSP (lihat [AUTENTIKASI.md](AUTENTIKASI.md#10-keamanan-dan-batasannya)),
jadi browser hanya mau memuat script dari domain yang terdaftar. Domain Google Analytics dan LogRocket
sudah dimasukkan dan sudah diuji. Kalau nanti mengganti atau menambah layanan monitoring lain (misalnya
Hotjar atau Sentry), tambahkan domainnya di `script-src` dan `connect-src` pada `frontend/vercel.json`
**dan** `frontend/netlify.toml`.

## Mencoba di lokal

```bash
# frontend/.env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Lalu restart `npm run dev`. Jangan lupa dikosongkan lagi kalau sudah selesai mencoba.

> Ad-blocker (uBlock Origin, Brave Shields, dan sejenisnya) biasanya memblokir Google Analytics dan
> LogRocket. Kalau kunjunganmu tidak muncul di dashboard, coba matikan dulu untuk situs ini.
