import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import ScrollToTop from "@/components/ui/ScrollToTop";
import PrivateRoute from "@/components/auth/PrivateRoute";

import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductForm from "./pages/AdminProductForm.new";
import ClientDashboard from "./pages/ClientDashboard";
import FacebookAdPage from "./pages/FacebookAdPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <SiteConfigProvider>
          <TooltipProvider>
            <div dir="rtl">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin-dashboard" element={
                    <PrivateRoute>
                      <AdminDashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/admin-product-form" element={
                    <PrivateRoute>
                      <AdminProductForm />
                    </PrivateRoute>
                  } />
                  <Route path="/admin-product-form/:id" element={
                    <PrivateRoute>
                      <AdminProductForm />
                    </PrivateRoute>
                  } />
                  <Route path="/client-dashboard/:orderId" element={<ClientDashboard />} />
                  <Route path="/facebook-ad/:productId" element={<FacebookAdPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </SiteConfigProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
