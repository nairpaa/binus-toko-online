import { useEffect, useState } from 'react';

export default function Loading({ text = 'Memuat data...' }) {
  // Kalau lama sekali, kemungkinan besar server gratis di Render sedang "bangun tidur".
  // Kasih tahu user supaya tidak mengira aplikasinya rusak.
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-body-secondary text-center">
      <div className="spinner-border text-primary mb-3" role="status" />
      <span>{text}</span>
      {slow && (
        <small className="mt-2" style={{ maxWidth: 360 }}>
          Server sedang dinyalakan, biasanya butuh kurang dari satu menit. Tunggu sebentar ya.
        </small>
      )}
    </div>
  );
}
