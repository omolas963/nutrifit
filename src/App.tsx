import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { TodayPage } from './pages/TodayPage';
import { RecipesPage } from './pages/RecipesPage';
import { MealPlanPage } from './pages/MealPlanPage';
import { WeightPage } from './pages/WeightPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/recetas" element={<RecipesPage />} />
            <Route path="/plan" element={<MealPlanPage />} />
            <Route path="/progreso" element={<ProgressPage />} />
            <Route path="/objetivo" element={<WeightPage />} />
            <Route path="/ajustes" element={<SettingsPage />} />
            <Route path="/privacidad" element={<PrivacyPage />} />
            <Route path="/terminos" element={<TermsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
