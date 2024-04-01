'use client';

import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { IconRefresh } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { AppModal, ellipsify } from '../ui/ui-layout';
import { useCluster } from '../cluster/cluster-data-access';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useMakeBet } from './bet-data-access';

export function BetButtons({ address }: { address: PublicKey }) {
    const wallet = useWallet();
    const { cluster } = useCluster();
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
