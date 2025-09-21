import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Users, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Opportunity {
  id: string;
  type: 'view' | 'feature' | 'inquiry' | 'trend';
  message: string;
  timestamp: Date;
  location?: string;
  audience?: string;
}

const AudienceOpportunities: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    // Generate mock opportunities based on user's craft
    generateOpportunities();
    
    // Set up interval to add new opportunities periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        addNewOpportunity();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.primaryCraft]);

  const generateOpportunities = () => {
    const craft = user?.primaryCraft || 'art';
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'London', 'New York', 'Tokyo', 'Berlin', 'Paris'];
    const audiences = ['interior designers', 'art collectors', 'cultural enthusiasts', 'textile lovers', 'home decorators'];
    
    const mockOpportunities: Opportunity[] = [
      {
        id: '1',
        type: 'view',
        message: `Great news! Your ${craft.toLowerCase()} with traditional motifs has been viewed 50 times by ${audiences[Math.floor(Math.random() * audiences.length)]} in ${locations[Math.floor(Math.random() * locations.length)]}.`,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        location: locations[Math.floor(Math.random() * locations.length)],
        audience: audiences[Math.floor(Math.random() * audiences.length)]
      },
      {
        id: '2',
        type: 'feature',
        message: `A blog focused on sustainable textiles has featured your profile and highlighted your traditional ${craft.toLowerCase()} techniques.`,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: '3',
        type: 'trend',
        message: `Trending: ${craft} pieces with natural dyes are gaining 40% more interest this month among international buyers.`,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        id: '4',
        type: 'inquiry',
        message: `5 new inquiries from ${locations[Math.floor(Math.random() * locations.length)]} customers interested in custom ${craft.toLowerCase()} pieces.`,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      }
    ];

    setOpportunities(mockOpportunities);
  };

  const addNewOpportunity = () => {
    const craft = user?.primaryCraft || 'art';
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'London', 'New York', 'Tokyo', 'Berlin', 'Paris'];
    const audiences = ['interior designers', 'art collectors', 'cultural enthusiasts', 'textile lovers', 'home decorators'];
    
    const newMessages = [
      `Your ${craft.toLowerCase()} work is trending in ${locations[Math.floor(Math.random() * locations.length)]}!`,
      `New interest from ${audiences[Math.floor(Math.random() * audiences.length)]} in your latest pieces.`,
      `A cultural magazine wants to feature your traditional ${craft.toLowerCase()} story.`,
      `Export inquiry received from ${locations[Math.floor(Math.random() * locations.length)]} for bulk orders.`,
      `Your work has been shared 25 times on social media this week.`
    ];

    const newOpportunity: Opportunity = {
      id: Date.now().toString(),
      type: ['view', 'feature', 'inquiry', 'trend'][Math.floor(Math.random() * 4)] as any,
      message: newMessages[Math.floor(Math.random() * newMessages.length)],
      timestamp: new Date(),
      location: locations[Math.floor(Math.random() * locations.length)],
      audience: audiences[Math.floor(Math.random() * audiences.length)]
    };

    setOpportunities(prev => [newOpportunity, ...prev.slice(0, 4)]); // Keep only 5 most recent
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-400" />;
      case 'feature':
        return <Users className="w-4 h-4 text-green-400" />;
      case 'inquiry':
        return <Globe className="w-4 h-4 text-purple-400" />;
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      default:
        return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-yellow-400" />
          <span>My Audience & Opportunities</span>
        </h2>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-yellow-400">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                {getIcon(opportunity.type)}
              </div>
              <div className="flex-1">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {opportunity.message}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  {formatTimeAgo(opportunity.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm">
            Your audience insights will appear here as your work gains visibility.
          </p>
        </div>
      )}
    </div>
  );
};

export default AudienceOpportunities;