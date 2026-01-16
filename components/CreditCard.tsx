
import React from 'react';
import { CardData, CardIssuer } from '../types';
import { ISSUER_COLORS, ISSUER_LOGOS } from '../constants';

interface CreditCardProps {
  data: CardData;
  issuer: CardIssuer;
  isFlipped: boolean;
}

const CreditCard: React.FC<CreditCardProps> = ({ data, issuer, isFlipped }) => {
  const cardColor = ISSUER_COLORS[issuer] || ISSUER_COLORS.unknown;
  
  return (
    <div className="relative w-full max-w-sm aspect-[1.586/1] mx-auto perspective-1000 group">
      <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front */}
        <div className={`absolute inset-0 backface-hidden rounded-2xl p-6 text-white shadow-2xl overflow-hidden transition-colors duration-500 ${cardColor}`}>
          {/* Chip and Logo */}
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md shadow-inner"></div>
            <div className="opacity-90">
              {ISSUER_LOGOS[issuer]}
            </div>
          </div>

          {/* Card Number */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Card Number</p>
            <p className="text-xl md:text-2xl mono tracking-wider font-semibold">
              {data.number || '•••• •••• •••• ••••'}
            </p>
          </div>

          {/* Holder and Expiry */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-0.5">Card Holder</p>
              <p className="text-sm font-medium uppercase truncate max-w-[180px]">
                {data.holder || 'Your Name'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-0.5">Expires</p>
              <p className="text-sm font-medium mono">
                {data.expiry || 'MM/YY'}
              </p>
            </div>
          </div>

          {/* Design Element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>

        {/* Back */}
        <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl text-white shadow-2xl overflow-hidden transition-colors duration-500 ${cardColor}`}>
          <div className="h-12 bg-gray-900 w-full mt-6"></div>
          <div className="px-6 mt-6">
            <div className="bg-white/20 h-10 rounded flex items-center justify-end px-4">
              <span className="text-black italic mono font-bold bg-white px-2 py-0.5 rounded shadow-inner">
                {data.cvv || '•••'}
              </span>
            </div>
            <p className="text-[10px] mt-2 opacity-60 leading-tight">
              Authorized signature. This card is property of the issuer. If found, please return to any branch or mail to the address on the reverse.
            </p>
          </div>
          <div className="absolute bottom-6 right-6 opacity-40">
            {ISSUER_LOGOS[issuer]}
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default CreditCard;
