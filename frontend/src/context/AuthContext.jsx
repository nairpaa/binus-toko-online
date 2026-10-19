import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ACCESS_TOKEN_KEY, getAccessToken, setAccessToken, setSessionExpiredHandler } from '../api/client';
import { getCurrentUser, loginRequest, logoutAllRequest, logoutRequest, registerRequest } from '../api/authApi';
import { setMonitoringUser, trackEvent } from '../lib/analytics';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Kalau ada token tersimpan dari kunjungan sebelumnya, cek dulu ke server apakah masih berlaku.
  // Selama pengecekan, halaman yang butuh login jangan buru-buru melempar ke halaman login.
  const [checking, setChecking] = useState(() => Boolean(getAccessToken()));

  // Pesan untuk halaman login kalau sesi berakhir sendiri (refresh token habis/dicabut).
  const [sessionMessage, setSessionMessage] = useState('');

  // Membedakan "user sendiri yang klik Keluar" dengan "belum login".
  // Yang pertama dibawa ke Beranda, yang kedua ke halaman login.
  const [loggedOutManually, setLoggedOutManually] = useState(false);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // Pengecekan awal saat aplikasi dibuka.
  useEffect(() => {
    setSessionExpiredHandler((message) => {
      clearSession();
      setSessionMessage(message || 'Sesi login kamu sudah berakhir. Silakan login lagi.');
    });

    if (!getAccessToken()) return;

    let ignore = false;
    // Kalau access token sudah kedaluwarsa, client.js otomatis refresh lalu mengulang request ini.
    getCurrentUser()
      .then((currentUser) => {
        if (!ignore) setUser(currentUser);
      })
      .catch(() => {}) // sesi habis sudah diurus handler di atas, error lain (server mati) dibiarkan
      .finally(() => {
        if (!ignore) setChecking(false);
      });

    return () => {
      ignore = true;
    };
  }, [clearSession]);

  // Samakan status login antar-tab. Logout di satu tab, tab lain ikut logout, begitu juga sebaliknya.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== ACCESS_TOKEN_KEY) return;
      if (!event.newValue) setUser(null);
      else if (!event.oldValue) getCurrentUser().then(setUser).catch(() => {});
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    setMonitoringUser(user);
  }, [user]);

  function startSession({ accessToken, user: sessionUser }) {
    setAccessToken(accessToken);
    setUser(sessionUser);
    setSessionMessage('');
    setLoggedOutManually(false);
  }

  async function login(email, password) {
    startSession(await loginRequest(email, password));
    trackEvent('login', { method: 'email' });
  }

  async function register(data) {
    startSession(await registerRequest(data));
    trackEvent('sign_up', { method: 'email' });
  }

  async function logout() {
    try {
      await logoutRequest();
    } catch {
      // Server tidak bisa dihubungi pun, di sisi browser tetap dianggap keluar.
    }
    setLoggedOutManually(true);
    clearSession();
    trackEvent('logout');
  }

  async function logoutAll() {
    const result = await logoutAllRequest();
    setLoggedOutManually(true);
    clearSession();
    trackEvent('logout_all_devices', { sessions: result.revoked });
    return result;
  }

  const value = {
    user,
    isLoggedIn: Boolean(user),
    isAdmin: user?.role === 'admin',
    checking,
    sessionMessage,
    loggedOutManually,
    login,
    register,
    logout,
    logoutAll,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
