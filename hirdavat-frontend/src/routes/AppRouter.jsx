import { Navigate, Route, Routes } from 'react-router-dom';

import AppShell from '../components/common/AppShell';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ProductList from '../pages/Products/ProductList';
import ProductDetail from '../pages/Products/ProductDetail';
import ProductForm from '../pages/Products/ProductForm';
import QuickSale from '../pages/POS/QuickSale';
import SaleReceipt from '../pages/Sales/SaleReceipt';
import CustomerList from '../pages/Customers/CustomerList';
import CustomerDetail from '../pages/Customers/CustomerDetail';
import CustomerForm from '../pages/Customers/CustomerForm';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />

          <Route path="/pos" element={<QuickSale />} />
          <Route path="/sales/:id" element={<SaleReceipt />} />

          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
