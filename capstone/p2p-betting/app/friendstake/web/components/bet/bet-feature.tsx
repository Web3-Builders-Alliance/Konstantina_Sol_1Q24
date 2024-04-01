'use client';

import { WalletButton } from '../solana/solana-provider';
import { AppHero } from '../ui/ui-layout';
import { BetButtons } from './bet-ui';
import { useWallet } from '@solana/wallet-adapter-react';

const links: { label: string; href: string }[] = [
  { label: 'Friendstake X', href: 'https://twitter.com/friendstake_xyz' },
];

export default function BetFeature() {
    const { publicKey } = useWallet();

  return (
    <div>
        <AppHero title="Friendstake" subtitle="Bet on anything." />
        <div className="hero py-[16px]">
            <div className="hero-content text-center">
                <WalletButton />
            </div>
        </div>
        <div className="my-4 text-center">
         {publicKey && <BetButtons address={publicKey} />}
        </div>
        <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="space-y-2">
          <p>Find out more</p>
          {links.map((link, index) => (
            <div key={index}>
              <a
                href={link.href}
                className="link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </div>
          ))}
        </div>
        </div>
    </div>
  );
}
