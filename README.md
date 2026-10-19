# TokoKita: Toko Online Sederhana

Aplikasi toko online dengan **React** di frontend, **Express** di backend, dan **MongoDB** sebagai database.
Pengunjung bisa melihat produk, mendaftar, dan login. Admin bisa menambah, mengubah, dan menghapus produk.

| Dokumen | Isi |
| --- | --- |
| [docs/AUTENTIKASI.md](docs/AUTENTIKASI.md) | Detail login JWT, refresh token, rotasi token, dan proteksi route |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Langkah deploy ke MongoDB Atlas, Render, dan Vercel/Netlify |
| [docs/MONITORING.md](docs/MONITORING.md) | Setup Google Analytics 4 dan LogRocket |

## Fitur

**Toko**
- **Beranda**: banner, pintasan per kategori, dan 4 produk terbaru.
- **Daftar Produk**: grid produk dengan pencarian, filter kategori, dan pengurutan.
- **Detail Produk**: gambar, harga, stok, dan deskripsi.

**Akun & keamanan**
- **Registrasi dan Login** dengan JWT. Access token disimpan di `localStorage`.
- **Refresh token** di cookie httpOnly, dirotasi setiap dipakai, dan pencurian token terdeteksi otomatis.
- **Proteksi route**: halaman *Akun Saya* khusus member, halaman kelola produk khusus admin.
- **Keluar dari semua perangkat**, plus status login yang tersinkron antar-tab.
- **Pengamanan tambahan**: rate limit login dan registrasi, batas sesi 30 hari, header keamanan (CSP,
  anti-clickjacking), dan perlindungan dari penebakan email lewat waktu respons.

**Admin**
- Tambah, ubah, dan hapus produk, dengan pratinjau gambar.

**Lain-lain**
- REST API CRUD dengan validasi dan pesan error berbahasa Indonesia.
- Monitoring dengan Google Analytics 4 dan/atau LogRocket.
- Siap deploy: `render.yaml`, `vercel.json`, `netlify.toml`.
- Tampilan responsif (Bootstrap 5, CSS Grid, Flexbox).

## Teknologi

| Bagian | Yang dipakai |
| --- | --- |
| Frontend | React 19, Vite, React Router 7, Bootstrap 5, Bootstrap Icons, Axios |
| Backend | Node.js, Express 5, Mongoose 9, jsonwebtoken, bcryptjs, cookie-parser, express-rate-limit, helmet |
| Database | MongoDB (lokal/Docker atau MongoDB Atlas) |
| Monitoring | Google Analytics 4, LogRocket |
| Hosting | Render (backend), Vercel atau Netlify (frontend) |

## Struktur folder

```
toko-online/
├── render.yaml                 # konfigurasi deploy backend ke Render
├── docker-compose.yml          # MongoDB lokal via Docker (opsional)
├── docs/                       # dokumentasi detail
├── backend/
│   ├── .env.example
│   └── src/
│       ├── server.js           # titik masuk: Express, cookie, route, health check
│       ├── config/db.js        # koneksi MongoDB
│       ├── models/             # Product, User, RefreshToken
│       ├── services/tokenService.js   # buat, rotasi, dan cabut token
│       ├── controllers/        # productController (CRUD), authController (login, refresh, dll)
│       ├── routes/             # productRoutes, authRoutes
│       ├── middleware/         # auth.js (requireAuth, requireAdmin), errorHandler.js
│       └── seed/               # data contoh + akun admin
└── frontend/
    ├── .env.example            # ID Google Analytics / LogRocket
    ├── vercel.json             # rewrite /api ke Render, fallback SPA, header keamanan
    ├── netlify.toml            # sama, untuk Netlify
    └── src/
        ├── main.jsx            # BrowserRouter, AuthProvider, init monitoring
        ├── App.jsx             # daftar route (publik, member, admin)
        ├── api/                # client.js (Axios + refresh otomatis), productApi, authApi
        ├── context/AuthContext.jsx    # status login untuk seluruh aplikasi
        ├── lib/analytics.js    # Google Analytics & LogRocket
        ├── components/         # Navbar, ProductCard, ProductForm, ProtectedRoute, AuthCard, dll
        ├── pages/              # Home, ProductList, ProductDetail, Login, Register, Account,
        │                       # AddProduct, EditProduct, NotFound
        └── index.css           # CSS Grid & Flexbox
```

## Menjalankan di komputer sendiri

**Prasyarat:** Node.js 20.19+ (atau 22.12+) dan MongoDB. Kalau belum punya MongoDB, cukup jalankan
`docker compose up -d` dari folder `toko-online/`.

**1. Backend**

```bash
cd backend
npm install
cp .env.example .env     # isi JWT_SECRET dan ADMIN_PASSWORD
npm run seed             # 14 produk contoh + akun admin
npm run dev              # http://localhost:5000
```

**2. Frontend** (di terminal lain)

```bash
cd frontend
npm install
cp .env.example .env     # boleh dibiarkan kosong
npm run dev              # http://localhost:5173
```

Frontend memanggil API lewat `/api`, lalu proxy Vite meneruskannya ke `localhost:5000`. Vite juga listen
di semua network interface, jadi aplikasinya bisa dibuka dari komputer lain lewat IP, misalnya dari laptop
host ke VM: `http://<IP-VM>:5173`. Alamatnya tampil di terminal Vite pada baris `Network:`.

**Akun untuk mencoba**

| Role | Cara masuk |
| --- | --- |
| Admin | Email `ADMIN_EMAIL` dan password `ADMIN_PASSWORD` dari `backend/.env` |
| Member | Daftar sendiri lewat tombol **Daftar** di navbar |

### Isi `backend/.env`

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `MONGO_URI` | ya | Lokal: `mongodb://127.0.0.1:27017/toko_online`. Production: connection string Atlas |
| `JWT_SECRET` | ya | Teks acak panjang. Buat dengan `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ACCESS_TOKEN_EXPIRES_IN` | - | Umur access token, default `15m` |
| `REFRESH_TOKEN_EXPIRES_DAYS` | - | Umur refresh token dalam hari, default `7` |
| `SESSION_MAX_DAYS` | - | Batas mutlak satu sesi login dalam hari, default `30` |
| `TRUST_PROXY` | - | Jumlah proxy yang dipercaya untuk membaca IP pengunjung. Lokal `loopback`, Render `2` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | untuk seed | Akun admin yang dibuat `npm run seed` |
| `PORT` | - | Default `5000` |

Mau ganti password admin? Ubah `ADMIN_PASSWORD`, lalu jalankan `npm run seed:admin`. Perintah ini hanya
membuat ulang akun admin, data produk tidak disentuh.

## Halaman (React Router)

| URL | Halaman | Akses |
| --- | --- | --- |
| `/` | Beranda | Semua |
| `/produk` | Daftar Produk | Semua |
| `/produk/:id` | Detail Produk | Semua |
| `/login`, `/daftar` | Login, Registrasi | Semua |
| `/akun` | Akun Saya | **Harus login** |
| `/produk/tambah`, `/produk/:id/edit` | Tambah/Edit Produk | **Harus admin** |

Route-nya didefinisikan di `frontend/src/App.jsx` dan dilindungi oleh `components/ProtectedRoute.jsx`.

## REST API

Base URL lokal: `http://localhost:5000/api`

| Method | Endpoint | Akses | Keterangan |
| --- | --- | --- | --- |
| GET | `/products` | publik | Semua produk (terbaru dulu) |
| GET | `/products/:id` | publik | Satu produk |
| POST | `/products` | admin | Tambah produk → `201` |
| PUT | `/products/:id` | admin | Ubah produk |
| DELETE | `/products/:id` | admin | Hapus produk |
| POST | `/auth/register` | publik | Daftar akun (role `user`) |
| POST | `/auth/login` | publik | Login → access token + cookie refresh token |
| POST | `/auth/refresh` | cookie | Tukar refresh token dengan access token baru |
| POST | `/auth/logout` | cookie | Keluar dari perangkat ini |
| POST | `/auth/logout-all` | login | Keluar dari semua perangkat |
| GET | `/auth/me` | login | Data akun yang sedang login |
| GET | `/health` | publik | Status server & database (dipakai Render) |

Endpoint yang butuh login menerima header `Authorization: Bearer <accessToken>`. Semua error berbentuk
`{ code, message }`. Daftar lengkap kode error ada di [AUTENTIKASI.md](docs/AUTENTIKASI.md#9-daftar-endpoint-dan-kode-error).

Contoh lewat terminal:

```bash
# Lihat produk (tanpa login)
curl http://localhost:5000/api/products

# Login admin, ambil access token-nya
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"PASSWORD_ADMIN"}' | sed -E 's/.*"accessToken":"([^"]+)".*/\1/')

# Tambah, ubah, hapus produk
curl -X POST http://localhost:5000/api/products -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"name":"Tumbler 500ml","price":125000,"stock":10}'
curl -X PUT http://localhost:5000/api/products/<id> -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"price":99000}'
curl -X DELETE http://localhost:5000/api/products/<id> -H "Authorization: Bearer $TOKEN"
```

Mau lihat isi database langsung? `docker exec -it toko-online-mongo mongosh toko_online`, lalu
`db.products.find()`, `db.users.find()`, atau `db.refreshtokens.find()`.

## Kesesuaian dengan ketentuan tugas

| Ketentuan | Di mana |
| --- | --- |
| Halaman Beranda, Daftar Produk, Detail Produk | `frontend/src/pages/Home.jsx`, `ProductList.jsx`, `ProductDetail.jsx` |
| Navigasi React Router | `frontend/src/App.jsx`, `components/Navbar.jsx` (`NavLink`), `useParams` di halaman detail |
| Layout Flexbox / CSS Grid | `frontend/src/index.css`: `.product-grid` (Grid), `.category-list` dan `.product-detail` (Flexbox) |
| Bootstrap | Diimpor di `main.jsx`, dipakai untuk navbar, card, form, badge, alert, spinner |
| REST API CRUD (Node.js + Express) | `backend/src/routes/productRoutes.js`, `controllers/productController.js` |
| Data di MongoDB | `backend/src/models/` (Mongoose) |
| Integrasi frontend-API (Axios) | `frontend/src/api/` |
| **Login & Registrasi (JWT, localStorage)** | `pages/Login.jsx`, `pages/Register.jsx`, `api/client.js`, `backend/src/controllers/authController.js` |
| **Proteksi route** | `components/ProtectedRoute.jsx` (frontend), `middleware/auth.js` (backend) |
| *Tambahan:* refresh token | `backend/src/services/tokenService.js`, detail di [docs/AUTENTIKASI.md](docs/AUTENTIKASI.md) |
| *Tambahan:* pengamanan | Rate limit di `routes/authRoutes.js`, header di `server.js` (helmet) dan `frontend/vercel.json` (CSP) |
| **Deployment** (Render + Vercel/Netlify) | `render.yaml`, `frontend/vercel.json`, `frontend/netlify.toml`, panduan di [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| **Monitoring** (Google Analytics / LogRocket) | `frontend/src/lib/analytics.js`, panduan di [docs/MONITORING.md](docs/MONITORING.md) |

## Kalau ada masalah

- **Backend berhenti dengan `JWT_SECRET belum diisi`**: isi `JWT_SECRET` di `backend/.env`.
- **`Gagal terhubung ke MongoDB`**: MongoDB belum jalan atau `MONGO_URI` salah. Kalau pakai Docker, cek dengan `docker ps`.
- **Login admin selalu gagal**: jalankan `npm run seed:admin` setelah mengisi `ADMIN_EMAIL` dan `ADMIN_PASSWORD`.
- **`Terlalu banyak percobaan login gagal`**: sudah 5 kali salah password untuk email itu. Tunggu 15 menit, atau restart backend.
- **`Terlalu banyak pendaftaran dari jaringan ini`**: sudah 10 kali mencoba daftar dari IP yang sama dalam 1 jam. Tunggu, atau restart backend.
- **Frontend menampilkan "Tidak bisa terhubung ke server"**: backend belum jalan, atau port-nya bukan 5000 (sesuaikan proxy di `frontend/vite.config.js`).
- **Perubahan kode tidak langsung muncul, dan terminal Vite menampilkan `ENOSPC: System limit for number of file watchers reached`**:
  ```bash
  echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
  ```
- **Tidak bisa dibuka dari host lewat IP VM**: pakai IP dari baris `Network:` di terminal Vite. IP VM bisa
  berubah setelah restart. Untuk VirtualBox NAT (IP `10.0.2.x`), tambahkan port forwarding 5173.
