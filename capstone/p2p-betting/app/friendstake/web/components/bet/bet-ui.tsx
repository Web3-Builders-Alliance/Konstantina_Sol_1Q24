'use client';

import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { IconRefresh, IconArrowUpRight } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { AppModal, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useCancelBet, useGetBets, useGetBetsByJudge, useGetBetsByMaker, useGetBetsByTaker, useMakeBet } from './bet-data-access';

export function BetsList({ address, filterBy = "any" }: { address: PublicKey, filterBy?: string }) {
  const [showAll, setShowAll] = useState(false);
  // const query = useGetBetsByMaker({ address });

  let query = useGetBets();
  switch (filterBy) {
    case "maker":
      query = useGetBetsByMaker({ address });
      break;
    case "taker":
      query = useGetBetsByTaker({ address });
      break;
    case "judge":
      query = useGetBetsByJudge({ address });
      break;
    case "default":
      break;
  }

  const items = useMemo(() => {
    if (showAll)
      return query.data;
    return query.data?.slice(0, 5);
  }, [query.data, showAll]);


  // console.log(items)

  return (
    <div className="space-y-2">
      <div className="justify-between">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">Bets as {filterBy}:</h2>
          <div className="space-x-2">
            {query.isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <button
                className="btn btn-sm btn-outline"
                onClick={async () => {
                  await query.refetch();
                }}
              >
                <IconRefresh size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      {query.isError && (
        <pre className="alert alert-error">
          Error: {query.error?.message.toString()}
        </pre>
      )}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div>No bets found.</div>
          ) : (
            <table className="table border-4 rounded-lg border-separate border-base-300">
              <thead>
                <tr>
                  <th>Bet Address</th>
                  <th>Creator</th>
                  <th>Opponent</th>
                  <th>Judge</th>
                  <th>Description</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">See More</th>
                </tr>
              </thead>
              <tbody>
                {items?.map(({ account, publicKey }) => (
                  <tr key={publicKey.toString()}>
                    <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={ellipsify(publicKey.toString())}
                            path={`account/${publicKey.toString()}`}
                          />
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={ellipsify(account.maker.toString())}
                            path={`account/${account.maker.toString()}`}
                          />
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={ellipsify(account.opponent.toString())}
                            path={`account/${account.opponent.toString()}`}
                          />
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={ellipsify(account.judge.toString())}
                            path={`account/${account.judge.toString()}`}
                          />
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          {account.description}
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="font-mono">
                        {Math.round((account.amount.toNumber() / LAMPORTS_PER_SOL) * 100000) / 100000} SOL
                      </span>
                    </td>
                    <td className="flex justify-center">
                      <span className="font-mono">
                        <a
                          href={`/bet/${publicKey.toString()}`}
                          className="link"
                        >
                          <IconArrowUpRight size={18} />
                        </a>
                      </span>
                    </td>
                  </tr>
                ))}

                {(query.data?.length ?? 0) > 5 && (
                  <tr>
                    <td colSpan={6} className="text-center">
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={() => setShowAll(!showAll)}
                      >
                        {showAll ? 'Show Less' : 'Show All'}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export function BetButtons({ address }: { address: PublicKey }) {
    const wallet = useWallet();
    const [showCreateBetModal, setShowCreateBetModal] = useState(false);

    return (
      <div>
        <ModalCreateBet
          address={address}
          show={showCreateBetModal}
          hide={() => setShowCreateBetModal(false)}
        />
        <div className="space-x-2">
          <button
            disabled={wallet.publicKey?.toString() !== address.toString()}
            className="btn btn-xs lg:btn-md btn-outline"
            onClick={() => setShowCreateBetModal(true)}
          >
            Create Bet
          </button>
        </div>
      </div>
    );
  }

function ModalCreateBet({
    hide,
    show,
    address,
  }: {
    hide: () => void;
    show: boolean;
    address: PublicKey;
  }) {
    // const wallet = useWallet();
    const wallet = useAnchorWallet();
    // const mutation = useTransferSol({ address });
    const mutation = useMakeBet({ address });
    const [opponent, setOpponent] = useState('');
    const [judge, setJudge] = useState('');
    const [amount, setAmount] = useState('0.1');
    const [description, setDescription] = useState('');

    if (!address || !wallet || !wallet.signTransaction) {
      return <div>Wallet not connected</div>;
    }

    return (
      <AppModal
        hide={hide}
        show={show}
        title="Create Bet"
        submitDisabled={!opponent || !judge || !amount || mutation.isPending}
        submitLabel="Create"
        submit={() => {
          mutation
            .mutateAsync({
              wallet,
              opponent: new PublicKey(opponent),
              judge: new PublicKey(judge),
              description: description,
              amount: parseFloat(amount),
            })
            .then(() => {
              hide();
              setOpponent('');
              setJudge('');
              setDescription('');
            });
        }}
      >
        <input
          disabled={mutation.isPending}
          type="text"
          placeholder="Opponent"
          className="input input-bordered w-full"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
        />
        <input
          disabled={mutation.isPending}
          type="text"
          placeholder="Judge"
          className="input input-bordered w-full"
          value={judge}
          onChange={(e) => setJudge(e.target.value)}
        />
        <input
          disabled={mutation.isPending}
          type="text"
          placeholder="Description"
          className="input input-bordered w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          disabled={mutation.isPending}
          type="number"
          step="0.1"
          placeholder="Amount"
          className="input input-bordered w-full"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </AppModal>
    );
  }

export function BetMakerButtons({ address, maker }: { address: PublicKey, maker?: PublicKey }) {
  const wallet = useWallet();
  const mutation = useCancelBet({ address });

  return (
    <div>
      <div className="space-x-2">
        <button
          disabled={!maker || wallet.publicKey?.toString() !== maker?.toString()}
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => {
            mutation
              .mutateAsync()
              .then(() => {
              });
          }}
        >
          Cancel Bet
        </button>
      </div>
    </div>
  );
}
