import { useEffect, useState } from 'react';
import { getProductById, getProducts } from '../api/productApi';
import { getErrorMessage } from '../api/client';

// Pola ambil data yang sama dipakai di beberapa halaman, jadi dibungkus jadi hook.
// `key` menentukan kapan data perlu diambil ulang, misalnya saat id produk berubah.
function useApi(request, key) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });

  useEffect(() => {
    // Penanda supaya hasil request yang sudah "basi" tidak menimpa state.
    // Ini kejadian kalau user pindah halaman sebelum request selesai.
    let ignore = false;
    setState({ data: null, loading: true, error: '' });

    request()
      .then((data) => {
        if (!ignore) setState({ data, loading: false, error: '' });
      })
      .catch((err) => {
        if (!ignore) setState({ data: null, loading: false, error: getErrorMessage(err) });
      });

    return () => {
      ignore = true;
    };
    // Sengaja cuma bergantung ke `key`. Fungsi `request` dibuat ulang tiap render,
    // kalau ikut dimasukkan nanti datanya di-fetch terus-terusan.
  }, [key]);

  return state;
}

export function useProducts() {
  return useApi(getProducts, 'semua-produk');
}

export function useProduct(id) {
  return useApi(() => getProductById(id), id);
}
