import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { ChildModeProvider } from "@/components/ChildModeContext";
import { DemoProvider } from "@/hooks/useDemoMode";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Parent from "./pages/Parent";
import ChildSelection from "./pages/ChildSelection";
import ChildHome from "./pages/ChildHome";
import Chat from "./pages/Chat";
import Activities from "./pages/Activities";
import ParentSettings from "./pages/ParentSettings";
import ChildProfileSuccess from "./pages/ChildProfileSuccess";
import FamilyAuth from "./pages/FamilyAuth";
import FamilyDashboard from "./pages/FamilyDashboard";
import ChildDetail from "./pages/ChildDetail";
import ChildProfile from "./pages/ChildProfile";
import ChildChat from "./pages/ChildChat";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Subscription from "./pages/Subscription";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DemoProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ChildModeProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/family-auth" element={<FamilyAuth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/family-dashboard" element={
                  <AuthGuard>
                    <FamilyDashboard />
                  </AuthGuard>
                } />
                <Route path="/child/:childId" element={
                  <AuthGuard>
                    <ChildDetail />
                  </AuthGuard>
                } />
                <Route path="/child-profile/:childId" element={
                  <AuthGuard>
                    <ChildProfile />
                  </AuthGuard>
                } />
                <Route path="/child-chat/:childId" element={
                  <AuthGuard>
                    <ChildChat />
                  </AuthGuard>
                } />
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
                <Route path="/child-profile-success" element={
                  <AuthGuard>
                    <ChildProfileSuccess />
                  </AuthGuard>
                } />
                <Route path="/subscription" element={
                  <AuthGuard>
                    <Subscription />
                  </AuthGuard>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ChildModeProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </DemoProvider>
  </QueryClientProvider>
);

export default App;
