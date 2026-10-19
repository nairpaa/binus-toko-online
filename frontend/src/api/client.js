import axios from 'axios';

// Semua request ke backend lewat '/api' di domain yang sama dengan frontend.
// Lokal diteruskan oleh proxy Vite, di production diteruskan oleh Vercel/Netlify ke server Render.
// Sengaja tidak langsung ke domain backend, supaya cookie refresh token tetap dianggap
// cookie milik situs ini sendiri (first-party) dan aman dipakai dengan SameSite=Strict.
const api = axios.create({
  baseURL: '/api',
  // Server gratis di Render "tidur" kalau lama tidak dipakai, dan butuh sampai ±1 menit untuk bangun.
  timeout: 60000,
});

// ---------- Access token di localStorage ----------

export const ACCESS_TOKEN_KEY = 'tokokita_access_token';

// localStorage bisa error di mode private browser tertentu, makanya dibungkus try/catch.
export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token) {
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Gagal simpan cukup diabaikan, efeknya cuma harus login ulang setelah halaman di-refresh.
  }
}

// Dipanggil kalau refresh token juga sudah tidak berlaku, artinya user harus login ulang.
// Diisi oleh AuthContext supaya state login di aplikasi ikut di-reset.
let handleSessionExpired = null;

export function setSessionExpiredHandler(handler) {
  handleSessionExpired = handler;
}

// ---------- Refresh token otomatis ----------

// Kode 401 dari backend yang artinya "access token-nya saja yang bermasalah, coba refresh".
const REFRESHABLE_CODES = ['TOKEN_EXPIRED', 'TOKEN_INVALID'];

// Kalau ada beberapa request yang gagal bersamaan, refresh cukup dilakukan sekali.
// Request lain ikut menunggu hasil refresh yang sama, jadi refresh token tidak dirotasi berkali-kali.
let refreshPromise = null;

export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh', null, { skipAuth: true })
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Tempel access token di setiap request (kecuali yang memang tidak butuh, seperti /auth/refresh).
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.skipAuth) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const canRefresh =
      response?.status === 401 &&
      REFRESHABLE_CODES.includes(response.data?.code) &&
      config &&
      !config.skipAuth &&
      !config._retried; // satu request cuma boleh diulang sekali, biar tidak muter terus

    if (!canRefresh) return Promise.reject(error);

    try {
      await refreshAccessToken();
    } catch (refreshError) {
      // Refresh ditolak (401) berarti sesi benar-benar habis. Kalau errornya hal lain,
      // misalnya server sedang mati, jangan langsung paksa logout.
      if (refreshError.response?.status === 401) {
        setAccessToken(null);
        handleSessionExpired?.(refreshError.response.data?.message);
      }
      return Promise.reject(error);
    }

    // Ulangi request yang tadi gagal. Token barunya ditempel lagi oleh request interceptor di atas.
    config._retried = true;
    return api(config);
  }
);

// Ubah error dari Axios jadi kalimat yang enak dibaca pengguna.
export function getErrorMessage(err) {
  if (err.response) {
    const { message, errors } = err.response.data || {};
    if (errors?.length) return `${message}: ${errors.join(', ')}.`;
    return message || `Server membalas dengan status ${err.response.status}.`;
  }

  if (err.code === 'ECONNABORTED') {
    return 'Server terlalu lama merespons. Coba muat ulang halaman sebentar lagi.';
  }

  // Request sudah dikirim tapi tidak ada balasan, biasanya backend belum dijalankan.
  if (err.request) {
    return 'Tidak bisa terhubung ke server. Coba cek apakah backend sudah dijalankan.';
  }

  return err.message;
}

export default api;
