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
      <div className="w-full max-w-[480px] min-h-[100dvh] mx-auto bg-cream-100 dark:bg-dark-bg text-bark-900 dark:text-dark-text font-sans shadow-2xl relative overflow-x-hidden">
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
    <div className="w-full max-w-[480px] min-h-[100dvh] mx-auto bg-cream-100 dark:bg-dark-bg text-bark-900 dark:text-dark-text flex flex-col font-sans transition-colors relative overflow-x-hidden shadow-2xl">
      <UpdateNotification />
      <Header />
      
      <main className="flex-1 w-full px-4 py-3 pb-28">
        {children}
      </main>

      <BottomNav />
      <AddFoodModal />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          refreshData();
        }}
      />
      <ProfessionalAssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
      />
      <DevicePermissionsModal
        isOpen={isDevicePermissionsOpen}
        onClose={() => setIsDevicePermissionsOpen(false)}
      />
      <Toast />
    </div>
  );
};
