import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { ChildModeProvider } from "@/components/ChildModeContext";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Parent from "./pages/Parent";
import ChildSelection from "./pages/ChildSelection";
import ChildHome from "./pages/ChildHome";
import Chat from "./pages/Chat";
import Activities from "./pages/Activities";
import ParentSettings from "./pages/ParentSettings";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ChildModeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/parent" element={
                <AuthGuard>
                  <Parent />
                </AuthGuard>
              } />
              <Route path="/child-selection" element={
                <AuthGuard>
                  <ChildSelection />
                </AuthGuard>
              } />
              <Route path="/child-home" element={
                <AuthGuard>
                  <ChildHome />
                </AuthGuard>
              } />
              <Route path="/chat" element={
                <AuthGuard>
                  <Chat />
                </AuthGuard>
              } />
              <Route path="/activities" element={
                <AuthGuard>
                  <Activities />
                </AuthGuard>
              } />
              <Route path="/settings" element={
                <AuthGuard>
                  <ParentSettings />
                </AuthGuard>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ChildModeProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
