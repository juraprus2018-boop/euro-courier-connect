import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import RoutesPage from "./pages/RoutesPage";
import RouteDetailPage from "./pages/RouteDetailPage";
import BestemmingenPage from "./pages/BestemmingenPage";
import BestemmingDetailPage from "./pages/BestemmingDetailPage";
import QuotePage from "./pages/QuotePage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import AlgemeneVoorwaardenPage from "./pages/AlgemeneVoorwaardenPage";
import PrivacybeleidPage from "./pages/PrivacybeleidPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLanden from "./pages/admin/AdminLanden";
import AdminLandBranding from "./pages/admin/AdminLandBranding";
import AdminNlPlaatsen from "./pages/admin/AdminNlPlaatsen";
import AdminBuitenlandSteden from "./pages/admin/AdminBuitenlandSteden";
import AdminRoutes from "./pages/admin/AdminRoutes";
import AdminAanvragen from "./pages/admin/AdminAanvragen";
import AdminInstellingen from "./pages/admin/AdminInstellingen";
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
          <Route path="/bestemmingen" element={<BestemmingenPage />} />
          <Route path="/bestemming/:slug" element={<BestemmingDetailPage />} />
          <Route path="/offerte" element={<QuotePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/algemene-voorwaarden" element={<AlgemeneVoorwaardenPage />} />
          <Route path="/privacybeleid" element={<PrivacybeleidPage />} />
          <Route path="/auth" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/landen" element={<AdminLanden />} />
          <Route path="/admin/landen/:id/branding" element={<AdminLandBranding />} />
          <Route path="/admin/nl-plaatsen" element={<AdminNlPlaatsen />} />
          <Route path="/admin/buitenland-steden" element={<AdminBuitenlandSteden />} />
          <Route path="/admin/routes" element={<AdminRoutes />} />
          <Route path="/admin/aanvragen" element={<AdminAanvragen />} />
          <Route path="/admin/instellingen" element={<AdminInstellingen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;