'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700/30 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">
              GasUp respects your privacy and is committed to protecting your personal information.
            </p>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">Information We Collect</h2>
            <ul className="text-gray-300 list-disc list-inside mb-4">
              <li>Wallet addresses for transaction processing</li>
              <li>Transaction data for cross-chain gas top-ups</li>
              <li>Network information for supported blockchains</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">How We Use Your Information</h2>
            <ul className="text-gray-300 list-disc list-inside mb-4">
              <li>Process cross-chain gas top-up transactions</li>
              <li>Provide transaction history and status updates</li>
              <li>Improve our service and user experience</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">Data Security</h2>
            <p className="text-gray-300 mb-4">
              We implement industry-standard security measures to protect your data. 
              All transactions are processed on-chain and we do not store private keys.
            </p>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please contact us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
