# Deployment

Panduan menaruh TokoKita di internet supaya bisa dibuka siapa saja lewat link publik.
Semua layanan di bawah punya **paket gratis**.

## Gambaran arsitektur

```mermaid
flowchart LR
    U([Pengunjung]) -->|https://toko-online.vercel.app| V[Vercel<br/>frontend React]
    V -->|"/api/* diteruskan (rewrite)"| R[Render<br/>backend Express]
    R --> M[(MongoDB Atlas)]
```

| Bagian | Layanan | Konfigurasi di repo |
| --- | --- | --- |
| Frontend (React) | **Vercel** (alternatif: Netlify) | `frontend/vercel.json` atau `frontend/netlify.toml` |
| Backend (Express) | **Render** (alternatif: Heroku, berbayar) | `render.yaml` |
| Database | **MongoDB Atlas** | connection string di env `MONGO_URI` |

Frontend tidak memanggil URL Render secara langsung. Browser memanggil `https://<frontend>/api/...`, lalu
Vercel/Netlify meneruskannya ke Render. Cara ini dibutuhkan supaya cookie refresh token tetap aman
(`SameSite=Strict`). Penjelasannya ada di [AUTENTIKASI.md](AUTENTIKASI.md#kenapa-api-dipanggil-lewat-api-bukan-langsung-ke-domain-backend).

Urutan pengerjaannya: **Database → Backend → Frontend**, karena setiap langkah butuh alamat dari langkah sebelumnya.

---

## 1. Siapkan repository GitHub

Render, Vercel, dan Netlify mengambil kode langsung dari GitHub.

```bash
cd toko-online
git init
git add .
git commit -m "Toko online: React + Express + MongoDB"
git branch -M main
git remote add origin https://github.com/<username>/toko-online.git
git push -u origin main
```

File `.env` sudah masuk `.gitignore`, jadi password dan secret tidak ikut ter-upload.

## 2. Database: MongoDB Atlas

1. Daftar di <https://www.mongodb.com/cloud/atlas/register>, lalu buat cluster **M0 (Free)**.
   Pilih provider **AWS** region **Singapore (ap-southeast-1)** supaya dekat dengan server Render.
2. **Database Access** → *Add New Database User*. Buat username dan password, lalu catat.
3. **Network Access** → *Add IP Address* → **Allow access from anywhere** (`0.0.0.0/0`).
   Ini perlu karena IP server Render gratis berubah-ubah.
4. **Connect** → *Drivers* → salin connection string-nya, lalu tambahkan nama database `toko_online`
   sebelum tanda `?`:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/toko_online?retryWrites=true&w=majority
   ```

5. Isi database production dengan produk contoh dan akun admin, dijalankan dari komputer sendiri.
   Pakai password admin yang **berbeda** dari yang di lokal:

   ```bash
   cd backend
   MONGO_URI="mongodb+srv://...toko_online?..." ADMIN_PASSWORD="password-admin-yang-kuat" npm run seed
   ```

   Variabel yang ditulis langsung di perintah seperti ini mengalahkan isi file `.env`.

## 3. Backend: Render

1. Daftar di <https://render.com> pakai akun GitHub.
2. **New → Blueprint** → pilih repo `toko-online`. Render membaca `render.yaml` dan menyiapkan service
   `toko-online-api` (region Singapore, paket Free).
3. Render menanyakan nilai `MONGO_URI`. Tempel connection string Atlas dari langkah 2.
   `JWT_SECRET` dibuat acak otomatis oleh Render, jadi tidak perlu diisi.
4. Klik **Apply** dan tunggu build selesai (sekitar 2-3 menit).
5. Catat URL-nya, misalnya `https://toko-online-api.onrender.com`, lalu cek di browser:

   ```
   https://toko-online-api.onrender.com/api/health     → {"status":"ok","database":"connected",...}
   https://toko-online-api.onrender.com/api/products   → daftar produk (JSON)
   ```

   Nilai `clientIp` di `/api/health` baru bisa dicek setelah frontend jadi (langkah 6), karena harus
   dibuka lewat link frontend.

<details>
<summary>Tanpa Blueprint (setting manual)</summary>

**New → Web Service** → pilih repo, lalu isi:

| Pengaturan | Nilai |
| --- | --- |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |
| Environment | `NODE_ENV=production`, `MONGO_URI=...`, `JWT_SECRET=<teks acak panjang>`, `TRUST_PROXY=2` |

</details>

> **Catatan paket gratis Render:** server "tidur" setelah 15 menit tanpa pengunjung. Request pertama
> sesudahnya butuh sekitar 30-60 detik untuk membangunkannya. Frontend sudah menangani ini dengan
> menampilkan pesan *"Server sedang dinyalakan..."* dan batas waktu request 60 detik.

## 4. Sambungkan frontend ke backend

Kalau URL Render kamu **bukan** `https://toko-online-api.onrender.com` (misalnya karena nama sudah dipakai
orang lain), ganti URL di file ini:

- `frontend/vercel.json`: bagian `destination` yang pertama
- `frontend/netlify.toml`: bagian `to` yang pertama

```json
{ "source": "/api/:path*", "destination": "https://URL-RENDER-KAMU.onrender.com/api/:path*" }
```

Commit dan push perubahannya.

## 5. Frontend: Vercel

1. Daftar di <https://vercel.com> pakai akun GitHub.
2. **Add New → Project** → import repo `toko-online`.
3. Isi pengaturannya:

   | Pengaturan | Nilai |
   | --- | --- |
   | Root Directory | `frontend` |
   | Framework Preset | Vite (terdeteksi otomatis) |
   | Environment Variables | `VITE_GA_MEASUREMENT_ID` dan/atau `VITE_LOGROCKET_APP_ID` (lihat [MONITORING.md](MONITORING.md)) |

4. Klik **Deploy**. Setelah selesai, kamu dapat link publik seperti `https://toko-online-abc.vercel.app`.

Environment variable `VITE_*` dimasukkan ke kode saat **build**. Jadi kalau nanti mengubahnya di
dashboard, lakukan **Redeploy** supaya perubahannya ikut.

<details>
<summary>Alternatif: Netlify</summary>

1. Daftar di <https://netlify.com> → **Add new site → Import an existing project** → pilih repo.
2. **Base directory**: `frontend`. Build command dan publish directory otomatis dibaca dari `netlify.toml`.
3. Tambahkan environment variable monitoring di **Site configuration → Environment variables**.
4. **Deploy**.

</details>

## 6. Cek hasil deployment

Buka link Vercel/Netlify, lalu periksa satu per satu:

- [ ] Beranda dan daftar produk tampil. Pembukaan pertama bisa lambat karena Render masih bangun.
- [ ] Buka detail produk, lalu **refresh** halaman. Halaman tidak berubah jadi 404.
- [ ] Daftar akun baru → masuk ke halaman **Akun Saya**.
- [ ] DevTools → Application → Cookies: ada `refresh_token` dengan **HttpOnly** dan **Secure** tercentang.
- [ ] Login sebagai admin → bisa tambah, ubah, dan hapus produk.
- [ ] Buka `/produk/tambah` sebagai user biasa → muncul halaman 403.
- [ ] Dashboard Google Analytics → **Reports → Realtime** menunjukkan kunjunganmu.
- [ ] Buka `https://<frontend>/api/health`. Nilai `clientIp` harus sama dengan IP internetmu (cek di
      <https://ifconfig.me>). Kalau yang muncul IP lain (milik server Vercel atau Render), naikkan
      `TRUST_PROXY` di Render satu angka, tunggu redeploy, lalu cek lagi. Nilai ini dipakai rate limit registrasi.
- [ ] Cek header keamanan di <https://securityheaders.com> dengan URL frontend. Hasil yang diharapkan: nilai **A**.
- [ ] DevTools → Console tidak menampilkan error `Content Security Policy` (script atau gambar yang diblokir).

## Kalau ada masalah

| Gejala | Kemungkinan penyebab | Solusi |
| --- | --- | --- |
| Daftar produk lama sekali lalu error | Render sedang bangun, atau `MONGO_URI` salah | Tunggu 1 menit lalu muat ulang. Cek **Logs** di Render: ada pesan `Gagal terhubung ke MongoDB`? |
| Log Render: `bad auth` / `IP not whitelisted` | User/password Atlas salah, atau Network Access belum `0.0.0.0/0` | Perbaiki di dashboard Atlas |
| Refresh halaman `/produk/...` jadi 404 | Root Directory di Vercel bukan `frontend`, jadi `vercel.json` tidak terbaca | Set Root Directory = `frontend`, lalu redeploy |
| Request `/api/...` balas 404 dari Vercel | URL Render di `vercel.json` salah | Perbaiki URL-nya (langkah 4), push, tunggu redeploy |
| Login berhasil, tapi sekitar 15 menit kemudian disuruh login lagi | Aplikasi dibuka lewat URL Render langsung, bukan lewat Vercel | Selalu buka lewat link frontend (Vercel/Netlify) |
| Backend gagal start: `JWT_SECRET belum diisi` | Env var belum ada (setting manual tanpa Blueprint) | Tambahkan `JWT_SECRET` di **Environment** Render |
| Data GA tidak muncul | Ad-blocker aktif, atau env var diubah tanpa redeploy | Matikan ad-blocker untuk situs ini, lalu redeploy frontend |
| Console: `Refused to load ... Content Security Policy` | Ada script/layanan baru yang domainnya belum masuk CSP | Tambahkan domainnya di `Content-Security-Policy` pada `vercel.json` **dan** `netlify.toml` |
| Banyak orang kena `Terlalu banyak pendaftaran` padahal baru sekali daftar | `TRUST_PROXY` terlalu kecil, semua pengunjung terbaca sebagai IP server Vercel | Sesuaikan `TRUST_PROXY` (lihat checklist di atas) |

## Bagaimana dengan Heroku?

Heroku sudah tidak punya paket gratis, tapi backend ini tetap bisa jalan di sana tanpa perubahan kode,
karena Heroku menjalankan `npm start` secara otomatis:

```bash
heroku create toko-online-api
heroku config:set NODE_ENV=production MONGO_URI="..." JWT_SECRET="..."
git subtree push --prefix backend heroku main
```

Setelah itu, ganti URL Render di `vercel.json`/`netlify.toml` dengan URL Heroku.
