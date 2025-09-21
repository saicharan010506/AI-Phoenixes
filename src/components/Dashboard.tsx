import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import WelcomeStoryCard from './dashboard/WelcomeStoryCard';
import ProductsShowcase from './dashboard/ProductsShowcase';
import AuthenticityLegacy from './dashboard/AuthenticityLegacy';
import AudienceOpportunities from './dashboard/AudienceOpportunities';
import CustomerMessages from './dashboard/CustomerMessages';
import TopNavigation from './dashboard/TopNavigation';
import AccountSettings from './dashboard/AccountSettings';
import RecordingBin from './dashboard/RecordingBin';
import Certifications from './dashboard/Certifications';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings' | 'recordings' | 'certifications'>('dashboard');

  if (!user) return null;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'settings':
        return <AccountSettings onBack={() => setCurrentView('dashboard')} />;
      case 'recordings':
        return <RecordingBin onBack={() => setCurrentView('dashboard')} />;
      case 'certifications':
        return <Certifications onBack={() => setCurrentView('dashboard')} />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <WelcomeStoryCard />
            </div>
            <div className="space-y-6">
              <AudienceOpportunities />
              <CustomerMessages />
            </div>
            <div className="lg:col-span-2">
              <ProductsShowcase />
            </div>
            <div>
              <AuthenticityLegacy />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      <TopNavigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default Dashboard;