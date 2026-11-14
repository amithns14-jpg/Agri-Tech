import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { FarmPage } from './pages/FarmPage';
import { CropRecommendationPage } from './pages/CropRecommendationPage';
import { SoilAnalysisPage } from './pages/SoilAnalysisPage';
import { FertilizerPage } from './pages/FertilizerPage';
import { IrrigationPage } from './pages/IrrigationPage';
import { DiseaseDetectionPage } from './pages/DiseaseDetectionPage';
import { WeatherPage } from './pages/WeatherPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { HistoryPage } from './pages/HistoryPage';
import { HistoryDetailPage } from './pages/HistoryDetailPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Top-Level App Layout */}
            <Route element={<AppLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/farm" element={<FarmPage />} />
                <Route path="/crop-recommendation" element={<CropRecommendationPage />} />
                <Route path="/soil-analysis" element={<SoilAnalysisPage />} />
                <Route path="/fertilizer-advisory" element={<FertilizerPage />} />
                <Route path="/irrigation-advisory" element={<IrrigationPage />} />
                <Route path="/disease-detection" element={<DiseaseDetectionPage />} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/history/:id" element={<HistoryDetailPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
