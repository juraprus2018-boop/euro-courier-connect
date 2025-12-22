import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import RoutesPage from "./pages/RoutesPage";
import RouteDetailPage from "./pages/RouteDetailPage";
import QuotePage from "./pages/QuotePage";
import ContactPage from "./pages/ContactPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLanden from "./pages/admin/AdminLanden";
import AdminNlPlaatsen from "./pages/admin/AdminNlPlaatsen";
import AdminBuitenlandSteden from "./pages/admin/AdminBuitenlandSteden";
import AdminRoutes from "./pages/admin/AdminRoutes";
import AdminAanvragen from "./pages/admin/AdminAanvragen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/route/:slug" element={<RouteDetailPage />} />
          <Route path="/offerte" element={<QuotePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/landen" element={<AdminLanden />} />
          <Route path="/admin/nl-plaatsen" element={<AdminNlPlaatsen />} />
          <Route path="/admin/buitenland-steden" element={<AdminBuitenlandSteden />} />
          <Route path="/admin/routes" element={<AdminRoutes />} />
          <Route path="/admin/aanvragen" element={<AdminAanvragen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;