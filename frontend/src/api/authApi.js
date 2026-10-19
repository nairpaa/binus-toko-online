import api from './client';

// Login dan registrasi tidak butuh access token. Hasilnya { accessToken, user },
// sedangkan refresh token dipasang server sebagai cookie httpOnly.
export async function registerRequest({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password }, { skipAuth: true });
  return data;
}

export async function loginRequest(email, password) {
  const { data } = await api.post('/auth/login', { email, password }, { skipAuth: true });
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data;
}

// Mencabut refresh token perangkat ini di server, sekaligus menghapus cookie-nya.
export async function logoutRequest() {
  await api.post('/auth/logout', null, { skipAuth: true });
}

// Mencabut semua refresh token milik akun ini (semua perangkat).
export async function logoutAllRequest() {
  const { data } = await api.post('/auth/logout-all');
  return data;
}
