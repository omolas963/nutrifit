import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Toast } from '../common/Toast';
import { AddFoodModal } from '../addFood/AddFoodModal';
import { AuthModal } from '../auth/AuthModal';
import { AuthGate } from '../auth/AuthGate';
import { ProfessionalAssessmentModal } from '../onboarding/ProfessionalAssessmentModal';
import { DevicePermissionsModal } from '../onboarding/DevicePermissionsModal';
import { UpdateNotification } from '../common/UpdateNotification';
import { useApp } from '../../context/AppContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    setCurrentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isAssessmentOpen,
    setIsAssessmentOpen,
    refreshData,
  } = useApp();

  const [isDevicePermissionsOpen, setIsDevicePermissionsOpen] = useState(false);

  useEffect(() => {
    // Check if device permissions onboarding was completed
    const configured = localStorage.getItem('nutrifit_permissions_configured');
    if (!configured) {
      const timer = setTimeout(() => {
        setIsDevicePermissionsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsDevicePermissionsOpen(true);
    window.addEventListener('open_device_permissions_modal', handleOpen);
    return () => window.removeEventListener('open_device_permissions_modal', handleOpen);
  }, []);

  // If user is not logged in, gate the entire app with AuthGate!
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-dark-bg text-bark-900 dark:text-dark-text font-sans">
        <AuthGate
          onAuthenticated={async (user) => {
            setCurrentUser(user);
            await refreshData();
            if (!user.hasCompletedAssessment) {
              setIsAssessmentOpen(true);
            }
          }}
        />
        <Toast />
        <DevicePermissionsModal
          isOpen={isDevicePermissionsOpen}
          onClose={() => setIsDevicePermissionsOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-dark-bg text-bark-900 dark:text-dark-text flex flex-col font-sans transition-colors pb-28">
      <UpdateNotification />
      <Header />
      
      <main className="flex-1 w-full max-w-xl mx-auto px-3.5 sm:px-4 py-3 sm:py-4">
        {children}
      </main>

      <BottomNav />
      <Toast />
      <AddFoodModal />

      {/* Auth Modal for profile management */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={async (user) => {
          setCurrentUser(user);
          await refreshData();
          if (!user.hasCompletedAssessment) {
            setIsAssessmentOpen(true);
          }
        }}
      />

      {/* Professional Clinical Assessment Questionnaire */}
      <ProfessionalAssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
      />

      {/* Device & Health Permissions Modal */}
      <DevicePermissionsModal
        isOpen={isDevicePermissionsOpen}
        onClose={() => setIsDevicePermissionsOpen(false)}
      />
    </div>
  );
};
