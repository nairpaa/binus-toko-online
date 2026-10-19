export default function Footer() {
  return (
    <footer className="bg-white border-top py-3 mt-auto">
      <div className="container d-flex flex-column flex-sm-row justify-content-between gap-1 small text-body-secondary">
        <span>&copy; {new Date().getFullYear()} TokoKita</span>
        <span>React + Express + MongoDB</span>
      </div>
    </footer>
  );
}
