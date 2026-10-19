// Kerangka tampilan yang dipakai bareng oleh halaman Login dan Registrasi.
export default function AuthCard({ icon, title, subtitle, children, footer }) {
  return (
    <div className="auth-wrapper">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="category-icon mx-auto mb-3">
              <i className={`bi ${icon}`} />
            </span>
            <h1 className="h4 fw-bold mb-1">{title}</h1>
            <p className="text-body-secondary small mb-0">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
      {footer && <p className="text-center small text-body-secondary mt-3">{footer}</p>}
    </div>
  );
}
