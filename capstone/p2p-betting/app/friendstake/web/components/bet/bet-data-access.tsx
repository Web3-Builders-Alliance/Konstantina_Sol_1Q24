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

export function useGetBets() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const provider = new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: 'confirmed',
  });

  const program = new Program(IDL, PEER_TO_PEER_BETTING_PROGRAM_ID, provider);

  return useQuery({
    queryKey: ['get-bets', { endpoint: connection.rpcEndpoint }],
    queryFn: () => program.account.bet.all()
  });
}

export function useGetBet({ address }: { address: PublicKey }) {
  // Fetch specific bet
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const provider = new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: 'confirmed',
  });

  const program = new Program(IDL, PEER_TO_PEER_BETTING_PROGRAM_ID, provider);

  return useQuery({
    queryKey: ['get-bet', { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => program.account.bet.fetch(address)
  });
}

export function useGetBetsByMaker({ address }: { address: PublicKey }) {
  // Get all bets with address as maker
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const provider = new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: 'confirmed',
  });

  const program = new Program(IDL, PEER_TO_PEER_BETTING_PROGRAM_ID, provider);

  return useQuery({
    queryKey: ['get-bets-maker', { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => {
      const accounts = program.account.bet.all(([
        {
          memcmp: {
            offset: 8,
            bytes: address.toBase58(), // first field in the bet account (see idl)
          },
        },
      ]));

      return accounts;
    },
  });
}

export function useGetBetsByTaker({ address }: { address: PublicKey }) {
  // Get all bets with address as taker
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const provider = new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: 'confirmed',
  });

  const program = new Program(IDL, PEER_TO_PEER_BETTING_PROGRAM_ID, provider);

  return useQuery({
    queryKey: ['get-bets-taker', { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => {
      const accounts = program.account.bet.all(([
        {
          memcmp: {
            offset: 8 + 32, // anchor discriminator, maker publicKey, opponent publicKey
            bytes: address.toBase58(),
          },
        },
      ]));

      return accounts;
    },
  });
}

export function useGetBetsByJudge({ address }: { address: PublicKey }) {
  // Get all bets with address as judge
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const provider = new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: 'confirmed',
  });

  const program = new Program(IDL, PEER_TO_PEER_BETTING_PROGRAM_ID, provider);

  return useQuery({
    queryKey: ['get-bets-judge', { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => {
      const accounts = program.account.bet.all(([
        {
          memcmp: {
            offset: 8 + 32 + 32,
            bytes: address.toBase58(),
          },
        },
      ]));

      return accounts;
    },
  });
}

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
