import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import OrderDetailPage from "./pages/OrderDetailPage";
import Customers from "./pages/Customers";
import LoginPage from './pages/LoginPage';
import { getToken, removeToken } from './services/loginService';
import Promotions from "./pages/Promotions";
import ColorAndSize from "./pages/ColorAndSize";
import InstagramPage from "./pages/Instagram";
import ImageManagementPage from "./pages/ImageManagementPage";
import AbandonedCartsPage from "./pages/AbandonedCartsPage";
import Layout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import React from "react";

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  element: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={<ProtectedRoute element={<Layout />} />}
          >
            <Route index element={<Navigate to="/products" replace />} />
            <Route path="categories" element={<Categories />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="customers" element={<Customers />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="colors-sizes" element={<ColorAndSize />} />
            <Route path="instagram" element={<InstagramPage />} />
            <Route path="image-management" element={<ImageManagementPage />} />
            <Route path="abandoned-carts" element={<AbandonedCartsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
