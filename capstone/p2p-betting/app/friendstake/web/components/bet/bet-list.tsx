'use client';

import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import { ExplorerLink } from '../cluster/cluster-ui';
import { AppHero, ellipsify } from '../ui/ui-layout';

import { BetButtons, BetsList } from './bet-ui';

export default function BetList() {
    const params = useParams();
    const address = useMemo(() => {
      if (!params.address) {
        return;
      }
      try {
        return new PublicKey(params.address);
      } catch (e) {
        console.log(`Invalid public key`, e);
      }
    }, [params]);

    if (!address) {
      return <div>Error loading account</div>;
    }

    return (
        <div>
          <AppHero
            title={ellipsify(address.toString())}
            subtitle={
              <div className="my-4">
                See the bets involving your account below
              </div>
            }
          >
            <div className="my-4">
              <BetButtons address={address} />
            </div>
          </AppHero>
          <div className="py-6">
                <BetsList address={address} filterBy='maker' />
            </div>
          <div className="py-6">
                <BetsList address={address} filterBy='taker' />
          </div>
          <div className="py-6">
                <BetsList address={address} filterBy='judge' />
          </div>
        </div>
    );
}
