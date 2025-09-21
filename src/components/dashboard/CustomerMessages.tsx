import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Globe, Languages } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  customerName: string;
  customerLocation: string;
  originalMessage: string;
  translatedMessage: string;
  originalLanguage: string;
  timestamp: Date;
  replied: boolean;
  myReply?: string;
  translatedReply?: string;
}

const CustomerMessages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    // Generate mock messages
    generateMockMessages();
    
    // Add new messages periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 15 seconds
        addNewMessage();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [user?.primaryCraft]);

  const generateMockMessages = () => {
    const mockMessages: Message[] = [
      {
        id: '1',
        customerName: 'Hans Mueller',
        customerLocation: 'Germany',
        originalMessage: 'Was sind die Abmessungen dieses Stoffes?',
        translatedMessage: 'What are the dimensions of this fabric?',
        originalLanguage: 'German',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        replied: false
      },
      {
        id: '2',
        customerName: 'Marie Dubois',
        customerLocation: 'France',
        originalMessage: 'Pouvez-vous créer une pièce personnalisée avec des motifs floraux?',
        translatedMessage: 'Can you create a custom piece with floral motifs?',
        originalLanguage: 'French',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        replied: true,
        myReply: 'Yes, I can create beautiful custom pieces with traditional floral motifs. It would take about 15 days to complete.',
        translatedReply: 'Oui, je peux créer de belles pièces personnalisées avec des motifs floraux traditionnels. Il faudrait environ 15 jours pour terminer.'
      },
      {
        id: '3',
        customerName: 'Yuki Tanaka',
        customerLocation: 'Japan',
        originalMessage: 'この作品の制作過程について教えてください。',
        translatedMessage: 'Please tell me about the creation process of this artwork.',
        originalLanguage: 'Japanese',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        replied: false
      }
    ];

    setMessages(mockMessages);
  };

  const addNewMessage = () => {
    const customers = [
      { name: 'Emma Wilson', location: 'UK', language: 'English' },
      { name: 'Carlos Rodriguez', location: 'Spain', language: 'Spanish' },
      { name: 'Li Wei', location: 'China', language: 'Chinese' },
      { name: 'Ahmed Hassan', location: 'UAE', language: 'Arabic' }
    ];

    const questions = [
      { en: 'Is this piece available for international shipping?', original: 'Is this piece available for international shipping?' },
      { en: '¿Cuánto tiempo toma crear una pieza similar?', original: 'How long does it take to create a similar piece?' },
      { en: '这件作品使用了什么材料？', original: 'What materials were used in this artwork?' },
      { en: 'هل يمكنك إنشاء قطعة مخصصة؟', original: 'Can you create a custom piece?' }
    ];

    const customer = customers[Math.floor(Math.random() * customers.length)];
    const question = questions[Math.floor(Math.random() * questions.length)];

    const newMessage: Message = {
      id: Date.now().toString(),
      customerName: customer.name,
      customerLocation: customer.location,
      originalMessage: question.en,
      translatedMessage: question.original,
      originalLanguage: customer.language,
      timestamp: new Date(),
      replied: false
    };

    setMessages(prev => [newMessage, ...prev.slice(0, 4)]); // Keep only 5 most recent
  };

  const handleReply = (message: Message) => {
    setSelectedMessage(message);
    setShowReplyModal(true);
    setReplyText('');
  };

  const sendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;

    // Simulate translation
    const translatedReply = translateToCustomerLanguage(replyText, selectedMessage.originalLanguage);

    const updatedMessages = messages.map(msg => 
      msg.id === selectedMessage.id 
        ? { 
            ...msg, 
            replied: true, 
            myReply: replyText,
            translatedReply 
          }
        : msg
    );

    setMessages(updatedMessages);
    setShowReplyModal(false);
    setSelectedMessage(null);
    setReplyText('');
  };

  const translateToCustomerLanguage = (text: string, targetLanguage: string): string => {
    // Mock translation - in real app, this would use a translation API
    const translations: { [key: string]: string } = {
      'German': 'Ja, ich kann wunderschöne maßgeschneiderte Stücke mit traditionellen Motiven erstellen.',
      'French': 'Oui, je peux créer de belles pièces personnalisées avec des motifs traditionnels.',
      'Japanese': 'はい、伝統的なモチーフを使った美しいカスタム作品を作ることができます。',
      'Spanish': 'Sí, puedo crear hermosas piezas personalizadas con motivos tradicionales.',
      'Chinese': '是的，我可以创作带有传统图案的美丽定制作品。',
      'Arabic': 'نعم، يمكنني إنشاء قطع مخصصة جميلة بزخارف تقليدية.'
    };

    return translations[targetLanguage] || text;
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
          <MessageCircle className="w-6 h-6 text-blue-400" />
          <span>Customer Messages</span>
        </h2>
        <div className="flex items-center space-x-1 text-yellow-400">
          <Languages className="w-4 h-4" />
          <span className="text-xs">Auto-translated</span>
        </div>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-white font-semibold text-sm">{message.customerName}</h3>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Globe className="w-3 h-3" />
                    <span className="text-xs">{message.customerLocation}</span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs">
                  {formatTimeAgo(message.timestamp)} • {message.originalLanguage}
                </p>
              </div>
              {message.replied && (
                <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                  Replied
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="bg-gray-600/30 rounded p-3">
                <p className="text-gray-300 text-sm">{message.translatedMessage}</p>
                {message.originalMessage !== message.translatedMessage && (
                  <p className="text-gray-500 text-xs mt-1 italic">
                    Original: "{message.originalMessage}"
                  </p>
                )}
              </div>

              {message.replied && message.myReply && (
                <div className="bg-yellow-500/10 rounded p-3 border-l-2 border-yellow-400">
                  <p className="text-gray-300 text-sm">{message.myReply}</p>
                  {message.translatedReply && (
                    <p className="text-gray-500 text-xs mt-1 italic">
                      Sent as: "{message.translatedReply}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {!message.replied && (
              <button
                onClick={() => handleReply(message)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm">
            Customer messages will appear here. All messages are automatically translated for you.
          </p>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              Reply to {selectedMessage.customerName}
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-gray-300 text-sm">{selectedMessage.translatedMessage}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Reply (in your language)
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={4}
                  placeholder="Type your reply here..."
                />
              </div>

              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <p className="text-blue-400 text-xs mb-1">
                  <Languages className="inline w-3 h-3 mr-1" />
                  Will be automatically translated to {selectedMessage.originalLanguage}
                </p>
                <p className="text-gray-400 text-xs">
                  Your message will be culturally adapted for professional communication.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reply</span>
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMessages;