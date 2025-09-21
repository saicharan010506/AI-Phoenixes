import React, { useState, useEffect } from 'react';
import { Award, QrCode, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Certification {
  id: string;
  productName: string;
  qrCode: string;
  timestamp: Date;
  story: string;
  verified: boolean;
}

const AuthenticityLegacy: React.FC = () => {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  useEffect(() => {
    // Load certifications from localStorage
    const savedCertifications = localStorage.getItem(`kalahasta_certifications_${user?.id}`);
    if (savedCertifications) {
      const parsed = JSON.parse(savedCertifications);
      setCertifications(parsed.map((cert: any) => ({ ...cert, timestamp: new Date(cert.timestamp) })));
    }
  }, [user?.id]);

  const saveCertifications = (newCertifications: Certification[]) => {
    localStorage.setItem(`kalahasta_certifications_${user?.id}`, JSON.stringify(newCertifications));
  };

  const generateQRCode = (productName: string): string => {
    // Generate a unique QR code data (in real app, this would be a proper QR code)
    const qrData = `https://kalahasta.com/verify/${user?.id}/${Date.now()}`;
    return qrData;
  };

  const createCertification = (productName: string) => {
    const recordings = JSON.parse(localStorage.getItem(`kalahasta_recordings_${user?.id}`) || '[]');
    const latestRecording = recordings[recordings.length - 1];
    
    const certification: Certification = {
      id: Date.now().toString(),
      productName,
      qrCode: generateQRCode(productName),
      timestamp: new Date(),
      story: latestRecording?.story || `This authentic ${productName} was created by ${user?.fullName}, a master ${user?.primaryCraft} artist. Each piece represents generations of traditional craftsmanship and cultural heritage.`,
      verified: true
    };

    const updatedCertifications = [...certifications, certification];
    setCertifications(updatedCertifications);
    saveCertifications(updatedCertifications);
    
    setShowCertificationModal(false);
    setSelectedProduct('');
  };

  const getProducts = () => {
    const products = JSON.parse(localStorage.getItem(`kalahasta_products_${user?.id}`) || '[]');
    return products;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Award className="w-6 h-6 text-yellow-400" />
          <span>Authenticity & Legacy</span>
        </h2>
        <button
          onClick={() => setShowCertificationModal(true)}
          className="bg-gradient-to-r from-yellow-400 to-purple-400 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-purple-500 transition-all duration-200 text-sm"
        >
          📜 Certify Work
        </button>
      </div>

      <div className="space-y-4">
        {certifications.length > 0 ? (
          certifications.map((cert) => (
            <div key={cert.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>{cert.productName}</span>
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Certified on {cert.timestamp.toLocaleDateString()}
                  </p>
                </div>
                {cert.verified && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>
              
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                {cert.story}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <QrCode className="w-4 h-4" />
                  <span className="text-sm">QR Code Generated</span>
                </div>
                <button className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
                  View Certificate
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">
              No certifications yet. Create your first digital certificate to verify your artwork's authenticity.
            </p>
          </div>
        )}
      </div>

      {/* Certification Modal */}
      {showCertificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Create Digital Certificate</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Product to Certify
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Choose a product</option>
                  {getProducts().map((product: any) => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">What will be included:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Your recorded story from the recording bin</li>
                  <li>• Product details and creation process</li>
                  <li>• Unique QR code for verification</li>
                  <li>• Digital certificate of authenticity</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => selectedProduct && createCertification(selectedProduct)}
                  disabled={!selectedProduct}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-purple-400 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50"
                >
                  Create Certificate
                </button>
                <button
                  onClick={() => setShowCertificationModal(false)}
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

export default AuthenticityLegacy;