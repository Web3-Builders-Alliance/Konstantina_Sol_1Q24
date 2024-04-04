'use client';

import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import { ExplorerLink } from '../cluster/cluster-ui';
import { AppHero, ellipsify } from '../ui/ui-layout';

import { BetButtons, BetJudgeButtons, BetMakerButtons, BetTakerButtons, BetsList } from './bet-ui';
import { useGetBet } from './bet-data-access';

export default function BetInfo() {
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

    const account = useGetBet({ address });
    console.log(account)

    return (
        <div>
          <AppHero
            title={ellipsify(address.toString())}
            subtitle={
              <div className="my-4">
                <ExplorerLink
                    path={`account/${address}`}
                    label="View in explorer"
                />
              </div>
            }
          >
            <div className="my-4">
              <BetMakerButtons address={address} maker={account.data?.maker}/>
            </div>
            <div className="my-4">
              <BetTakerButtons address={address} taker={account.data?.opponent}/>
            </div>
            <div className="my-4">
              <BetJudgeButtons address={address} judge={account.data?.judge}/>
            </div>
          </AppHero>

          <div>
          {!account.data ? (
            <div>Bet not found</div>
          ) : (
            <table className="table border-4 rounded-lg border-separate border-base-300 mb-6">
                <tr>
                  <th>Creator</th>
                  <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={account.data.maker.toString()}
                            path={`account/${account.data.maker.toString()}`}
                          />
                        </span>
                      </div>
                  </td>
                </tr>
                <tr>
                  <th>Opponent</th>
                  <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={account.data.opponent.toString()}
                            path={`account/${account.data.opponent.toString()}`}
                          />
                        </span>
                      </div>
                  </td>
                </tr>
                <tr>
                  <th>Judge</th>
                  <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={account.data.judge.toString()}
                            path={`account/${account.data.judge.toString()}`}
                          />
                        </span>
                      </div>
                  </td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                            {account.data.description}
                        </span>
                      </div>
                  </td>
                </tr>
                <tr>
                  <th>Amount</th>
                  <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                           {Math.round((account.data.amount.toNumber() / LAMPORTS_PER_SOL) * 100000) / 100000 } SOL
                        </span>
                      </div>
                  </td>
                </tr>
                {/* <tr>
                  <th className="text-right">See More</th>
                </tr> */}
            </table>
          )}
        </div>

        </div>
    );
}
