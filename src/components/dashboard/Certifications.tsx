import React, { useState, useEffect } from 'react';
import { ArrowLeft, Award, QrCode, Download, Share2, Eye, CheckCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Certification {
  id: string;
  productName: string;
  qrCode: string;
  timestamp: Date;
  story: string;
  verified: boolean;
  certificateNumber: string;
}

interface CertificationsProps {
  onBack: () => void;
}

const Certifications: React.FC<CertificationsProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    loadCertifications();
  }, [user?.id]);

  const loadCertifications = () => {
    const savedCertifications = localStorage.getItem(`kalahasta_certifications_${user?.id}`);
    if (savedCertifications) {
      const parsed = JSON.parse(savedCertifications);
      setCertifications(parsed.map((cert: any) => ({ 
        ...cert, 
        timestamp: new Date(cert.timestamp),
        certificateNumber: cert.certificateNumber || `KH-${cert.id.slice(-6).toUpperCase()}`
      })));
    }
  };

  const downloadCertificate = (certification: Certification) => {
    // Create a simple certificate content
    const certificateContent = `
KALAHASTA DIGITAL CERTIFICATE OF AUTHENTICITY

Certificate Number: ${certification.certificateNumber}
Product: ${certification.productName}
Artist: ${user?.fullName}
Craft: ${user?.primaryCraft}
Date Certified: ${certification.timestamp.toLocaleDateString()}

Story:
${certification.story}

QR Code: ${certification.qrCode}

This certificate verifies the authenticity and heritage of the above artwork.
    `;

    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KalaHasta_Certificate_${certification.certificateNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareCertificate = (certification: Certification) => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate of Authenticity - ${certification.productName}`,
        text: `Authentic ${certification.productName} by ${user?.fullName} - Certified by KalaHasta`,
        url: certification.qrCode
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(certification.qrCode);
      alert('Certificate link copied to clipboard!');
    }
  };

  const viewCertificate = (certification: Certification) => {
    setSelectedCertification(certification);
    setShowCertificateModal(true);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Award className="w-7 h-7 text-yellow-400" />
                <span>Digital Certifications</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Your authenticated artworks with blockchain-verified certificates
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {certifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((certification) => (
                <div key={certification.id} className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-6 border border-gray-600 hover:border-yellow-400/50 transition-all duration-200">
                  {/* Certificate Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-gray-900" />
                      </div>
                      {certification.verified && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      #{certification.certificateNumber}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="mb-4">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {certification.productName}
                    </h3>
                    <div className="flex items-center space-x-1 text-gray-400 text-sm mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(certification.timestamp)}</span>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {certification.story}
                    </p>
                  </div>

                  {/* QR Code Indicator */}
                  <div className="bg-gray-600/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <QrCode className="w-4 h-4" />
                      <span className="text-sm font-medium">QR Code Generated</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      Scan to verify authenticity
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewCertificate(certification)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => downloadCertificate(certification)}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                      title="Download Certificate"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => shareCertificate(certification)}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                      title="Share Certificate"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Certifications Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Create your first digital certificate to verify your artwork's authenticity. 
                Go to the dashboard and use the "Certify Work" feature.
              </p>
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Detail Modal */}
      {showCertificateModal && selectedCertification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Certificate Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gray-900" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                KALAHASTA DIGITAL CERTIFICATE
              </h2>
              <p className="text-yellow-400 font-semibold">
                Certificate of Authenticity
              </p>
              <p className="text-gray-400 text-sm mt-1">
                #{selectedCertification.certificateNumber}
              </p>
            </div>

            {/* Certificate Content */}
            <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-xl p-6 border border-gray-600 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-gray-400 text-sm font-medium mb-1">ARTWORK</h4>
                  <p className="text-white font-semibold">{selectedCertification.productName}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm font-medium mb-1">ARTIST</h4>
                  <p className="text-white font-semibold">{user?.fullName}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm font-medium mb-1">CRAFT TRADITION</h4>
                  <p className="text-white font-semibold">{user?.primaryCraft}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm font-medium mb-1">CERTIFIED DATE</h4>
                  <p className="text-white font-semibold">{formatDate(selectedCertification.timestamp)}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-gray-400 text-sm font-medium mb-2">HERITAGE STORY</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {selectedCertification.story}
                </p>
              </div>

              <div className="bg-gray-600/30 rounded-lg p-4">
                <h4 className="text-gray-400 text-sm font-medium mb-2">VERIFICATION</h4>
                <div className="flex items-center space-x-3">
                  <QrCode className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-white text-sm font-medium">QR Code Available</p>
                    <p className="text-gray-400 text-xs">
                      Scan to verify authenticity on blockchain
                    </p>
                  </div>
                  {selectedCertification.verified && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => downloadCertificate(selectedCertification)}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Certificate</span>
              </button>
              <button
                onClick={() => shareCertificate(selectedCertification)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certifications;