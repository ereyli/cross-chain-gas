'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700/30 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">
              By using GasUp, you agree to these Terms of Service.
            </p>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">Service Description</h2>
            <p className="text-gray-300 mb-4">
              GasUp is a cross-chain gas top-up service that allows users to bridge ETH and tokens 
              between multiple blockchain networks including Ethereum, Base, Arbitrum, Optimism, 
              Polygon, Linea, and others.
            </p>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">User Responsibilities</h2>
            <ul className="text-gray-300 list-disc list-inside mb-4">
              <li>Ensure you have sufficient funds for gas fees</li>
              <li>Verify transaction details before confirming</li>
              <li>Keep your wallet secure and private keys safe</li>
              <li>Comply with applicable laws and regulations</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">Limitations</h2>
            <ul className="text-gray-300 list-disc list-inside mb-4">
              <li>GasUp is provided &quot;as is&quot; without warranties</li>
              <li>We are not responsible for network congestion or delays</li>
              <li>Users are responsible for their own transactions</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">Risk Disclosure</h2>
            <p className="text-gray-300 mb-4">
              Cross-chain transactions involve risks including but not limited to network congestion, 
              smart contract bugs, and bridge vulnerabilities. Use at your own risk.
            </p>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">Contact Us</h2>
            <p className="text-gray-300">
              For questions about these Terms of Service, please contact us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
