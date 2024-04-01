'use client';

import { useConnection, useWallet, useAnchorWallet, AnchorWallet } from '@solana/wallet-adapter-react';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTransactionToast } from '../ui/ui-layout';

// import { IDL, PeerToPeerBetting } from '../../../../../target/types/peer_to_peer_betting'; // needs to be under rootDir
import { IDL, PeerToPeerBetting } from '../../programs/peer_to_peer_betting';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';

const PEER_TO_PEER_BETTING_PROGRAM_ID = new PublicKey(
    'CXE5bjWmUv7QAivvg6gjZTvZ246F99mCaKTNKoAuCCDc' // devnet
);

export function useMakeBet({ address }: { address: PublicKey }) { // address: the connected wallet ??
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const wallet = useAnchorWallet();
  const provider = new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: 'confirmed',
  });

  const program = new Program(IDL, PEER_TO_PEER_BETTING_PROGRAM_ID, provider);

  return useMutation({
    mutationKey: ['make-bet', { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (input: {wallet: AnchorWallet, opponent: PublicKey, judge: PublicKey, description: String, amount: number}) => {

        const bet = PublicKey.findProgramAddressSync(
            [
              Buffer.from("bet"),
              input.wallet.publicKey.toBuffer(),
              input.opponent.toBuffer(),
              input.judge.toBuffer(),
              Buffer.from(input.description)
            ],
            program.programId
          )[0];

          const vault = PublicKey.findProgramAddressSync(
            [
              Buffer.from("vault"),
              bet.toBuffer(),
            ],
            program.programId
          )[0];

        const tx = await program.methods
            .make(input.description.toString(), new BN(input.amount * LAMPORTS_PER_SOL))
            .accounts({
                maker: input.wallet.publicKey,
                opponent: input.opponent,
                judge: input.judge,
                bet,
                vault,
                systemProgram: SystemProgram.programId
            })
            .rpc();

        return tx;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`);
    },
  });
}
