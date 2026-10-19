import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Semua halaman memakai Layout yang sama (navbar + footer) */}
      <Route element={<Layout />}>
        {/* Bebas dibuka siapa saja */}
        <Route path="/" element={<Home />} />
        <Route path="/produk" element={<ProductList />} />
        <Route path="/produk/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/daftar" element={<Register />} />

        {/* Harus login (user biasa maupun admin) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/akun" element={<Account />} />
        </Route>

        {/* Harus login sebagai admin */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/produk/tambah" element={<AddProduct />} />
          <Route path="/produk/:id/edit" element={<EditProduct />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
