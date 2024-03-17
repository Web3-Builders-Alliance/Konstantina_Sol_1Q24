use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{transfer_checked, TransferChecked}, token_interface::{close_account, CloseAccount, Mint, TokenAccount, TokenInterface}};

use crate::state::Escrow;

// refund: maker cancels the escrow and gets their tokens back

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    // the InterfaceAccount gives you the ability to interact both with the token program and the token2022 program
    pub mint_x: InterfaceAccount<'info, Mint>, // IS necessary because we actually USE the account, see mint in TransferChecked
    // that's how solana works and achieves parallelism, you need to pass all the accounts that will be used in a tx
    pub mint_y: InterfaceAccount<'info, Mint>, // not really necessary, we could just refer to it as escrow.mint_y
    #[account(
        mut,
        associated_token::mint = escrow.mint_x, // or just mint_x
        associated_token::authority = escrow
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        has_one = mint_x, // extra validation (extra compute units but better security)
        has_one = mint_y,
        close = maker, // close account and refund the maker - we can do that because we own this account
        // vault isn't from our program (it belongs to the token program) so we can't use this constraint
        // we'll close the vault with a cpi call
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        init_if_needed,
        payer = maker,
        associated_token::mint = mint_x,
        associated_token::authority = maker
    )]
    pub maker_ata_x: InterfaceAccount<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>
}

impl<'info> Refund<'info> {
    // empty the vault -> CPI to the maker_ata_x
    pub fn empty_vault(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.maker_ata_x.to_account_info(),
            mint: self.mint_x.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        let seeds = [
            b"escrow",
            self.maker.key.as_ref(),
            &self.escrow.seed.to_le_bytes(),
            &[self.escrow.bump]
        ];

        let signer_seeds: &[&[&[u8]]; 1] = &[&seeds[..]];

        // we will transfer out of a PDA so we need new_with_signer and seeds
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer_checked(cpi_ctx, self.escrow.amount, self.mint_x.decimals)
    }

    // close vault -> CPI close_account()
    pub fn close_vault(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.maker.to_account_info(), // lamports refunded to the maker
            authority: self.escrow.to_account_info(),
        };

        let seeds = [
            b"escrow",
            self.maker.key.as_ref(),
            &self.escrow.seed.to_le_bytes(),
            &[self.escrow.bump]
        ];

        let signer_seeds: &[&[&[u8]]; 1] = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        close_account(cpi_ctx)
    }
}
