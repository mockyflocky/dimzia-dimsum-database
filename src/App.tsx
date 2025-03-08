
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { OrdersProvider } from "@/hooks/useOrders";

// Pages
import Index from "@/pages/Index";
import Catalog from "@/pages/Catalog";
import Checkout from "@/pages/Checkout";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Components
import Navbar from "@/components/Navbar";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
