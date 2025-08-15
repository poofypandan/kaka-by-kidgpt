import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ChildModeProvider } from "@/components/ChildModeContext";
import { DemoProvider } from "@/hooks/useDemoMode";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Parent from "./pages/Parent";
import ChildSelection from "./pages/ChildSelection";
import ChildHome from "./pages/ChildHome";
import ChildDashboard from "./pages/ChildDashboard";
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
                
                {/* Parent Routes */}
                <Route path="/family-dashboard" element={
                  <ProtectedRoute allowedRoles={['primary_parent', 'secondary_parent']}>
                    <FamilyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/children" element={
                  <ProtectedRoute allowedRoles={['primary_parent', 'secondary_parent']}>
                    <FamilyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/safety" element={
                  <ProtectedRoute allowedRoles={['primary_parent', 'secondary_parent']}>
                    <FamilyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/billing" element={
                  <ProtectedRoute allowedRoles={['primary_parent']}>
                    <FamilyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute allowedRoles={['primary_parent', 'secondary_parent']}>
                    <ParentSettings />
                  </ProtectedRoute>
                } />
                
                {/* Child Routes */}
                <Route path="/child-dashboard" element={
                  <ProtectedRoute allowedRoles={['child']}>
                    <ChildDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/games" element={
                  <ProtectedRoute allowedRoles={['child']}>
                    <Activities />
                  </ProtectedRoute>
                } />
                <Route path="/stories" element={
                  <ProtectedRoute allowedRoles={['child']}>
                    <Activities />
                  </ProtectedRoute>
                } />
                
                {/* Shared Routes - All roles */}
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                
                {/* Legacy Routes for Backward Compatibility */}
                <Route path="/child/:childId" element={
                  <ProtectedRoute allowedRoles={['primary_parent', 'secondary_parent']}>
                    <ChildDetail />
                  </ProtectedRoute>
                } />
                <Route path="/child-profile/:childId" element={
                  <ProtectedRoute allowedRoles={['primary_parent', 'secondary_parent']}>
                    <ChildProfile />
                  </ProtectedRoute>
                } />
                <Route path="/child-chat/:childId" element={
                  <ProtectedRoute allowedRoles={['primary_parent', 'secondary_parent']}>
                    <ChildChat />
                  </ProtectedRoute>
                } />
                <Route path="/parent" element={
                  <ProtectedRoute allowedRoles={['primary_parent', 'secondary_parent']}>
                    <Parent />
                  </ProtectedRoute>
                } />
                <Route path="/child-selection" element={
                  <ProtectedRoute allowedRoles={['primary_parent', 'secondary_parent']}>
                    <ChildSelection />
                  </ProtectedRoute>
                } />
                <Route path="/child-home" element={
                  <ProtectedRoute allowedRoles={['child']}>
                    <ChildHome />
                  </ProtectedRoute>
                } />
                <Route path="/activities" element={
                  <ProtectedRoute>
                    <Activities />
                  </ProtectedRoute>
                } />
                <Route path="/child-profile-success" element={
                  <ProtectedRoute allowedRoles={['primary_parent', 'secondary_parent']}>
                    <ChildProfileSuccess />
                  </ProtectedRoute>
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
