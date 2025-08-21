'use client';

import { ChainLogo } from '../../components/ChainLogo';

export default function TestLogos() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Logo Test Page</h1>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <ChainLogo chain="ethereum" size={64} />
          <p className="mt-2 text-sm">Ethereum</p>
        </div>
        <div className="text-center">
          <ChainLogo chain="base" size={64} />
          <p className="mt-2 text-sm">Base</p>
        </div>
        <div className="text-center">
          <ChainLogo chain="op" size={64} />
          <p className="mt-2 text-sm">Optimism</p>
        </div>
        <div className="text-center">
          <ChainLogo chain="arbitrum" size={64} />
          <p className="mt-2 text-sm">Arbitrum</p>
        </div>
        <div className="text-center">
          <ChainLogo chain="sonic" size={64} />
          <p className="mt-2 text-sm">Sonic</p>
        </div>
        <div className="text-center">
          <ChainLogo chain="unichain" size={64} />
          <p className="mt-2 text-sm">Unichain</p>
        </div>
        <div className="text-center">
          <ChainLogo chain="ink" size={64} />
          <p className="mt-2 text-sm">Ink</p>
        </div>
        <div className="text-center">
          <ChainLogo chain="hyperevm" size={64} />
          <p className="mt-2 text-sm">HyperEVM</p>
        </div>
        <div className="text-center">
          <ChainLogo chain="linea" size={64} />
          <p className="mt-2 text-sm">Linea</p>
        </div>
        <div className="text-center">
          <ChainLogo chain="polygon" size={64} />
          <p className="mt-2 text-sm">Polygon</p>
        </div>
        <div className="text-center">
          <ChainLogo chain="abstract" size={64} />
          <p className="mt-2 text-sm">Abstract</p>
        </div>
        <div className="text-center">
          <ChainLogo chain="zora" size={64} />
          <p className="mt-2 text-sm">Zora</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Direct Image Test</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <img src="/images/chains/logo/sonic-logo.jpg" alt="Sonic" width={64} height={64} className="rounded-xl" />
            <p className="mt-2 text-sm">Direct Sonic</p>
          </div>
          <div className="text-center">
            <img src="/images/chains/logo/base-logo.jpg" alt="Base" width={64} height={64} className="rounded-xl" />
            <p className="mt-2 text-sm">Direct Base</p>
          </div>
        </div>
      </div>
    </div>
  );
}
