import React, { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { useApp } from '../../context/AppContext';
import { PhotoTab } from './PhotoTab';
import { TextTab } from './TextTab';
import { VoiceTab } from './VoiceTab';
import { SearchTab } from './SearchTab';
import { Camera, PenLine, Mic, Search } from 'lucide-react';

type TabKey = 'photo' | 'text' | 'voice' | 'search';

export const AddFoodModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, preselectedMealForAdd } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('photo');

  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    { key: 'photo', label: 'Foto', icon: <Camera className="w-4 h-4" /> },
    { key: 'text', label: 'Escribir', icon: <PenLine className="w-4 h-4" /> },
    { key: 'voice', label: 'Voz', icon: <Mic className="w-4 h-4" /> },
    { key: 'search', label: 'Buscar', icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <BottomSheet
      isOpen={isAddModalOpen}
      onClose={() => setIsAddModalOpen(false)}
      title="Añadir comida"
      maxHeight="max-h-[92vh]"
    >
      <div className="space-y-4">
        {/* Navigation Tabs Pill Bar */}
        <div className="flex bg-cream-200 dark:bg-dark-surface p-1 rounded-2xl">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  isActive
                    ? 'bg-white dark:bg-dark-card text-bark-900 dark:text-solar shadow-sm'
                    : 'text-bark-600 dark:text-dark-muted hover:text-bark-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="pt-1">
          {activeTab === 'photo' && <PhotoTab />}
          {activeTab === 'text' && <TextTab />}
          {activeTab === 'voice' && <VoiceTab onSwitchToText={() => setActiveTab('text')} />}
          {activeTab === 'search' && <SearchTab initialMealType={preselectedMealForAdd} />}
        </div>
      </div>
    </BottomSheet>
  );
};
