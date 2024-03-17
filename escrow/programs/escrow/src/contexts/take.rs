use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{transfer_checked, TransferChecked}, token_interface::{Mint, TokenAccount, TokenInterface}};

use crate::state::Escrow;

#[derive(Accounts)]
pub struct Take<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,
    /// CHECK: This is fine. We only use maker for the ATA constraints
    pub maker: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [
            b"escrow",
            maker.key().as_ref(),
            escrow.seed.to_le_bytes().as_ref()
        ],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    pub mint_x: InterfaceAccount<'info, Mint>,
    pub mint_y: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint_x,
        associated_token::authority = escrow
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint_x,
        associated_token::authority = maker
    )]
    pub maker_ata_x: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut, // should we do init_if_needed here too because maker maybe went and closed the account?
        associated_token::mint = mint_y,
        associated_token::authority = maker
    )]
    pub maker_ata_y: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = mint_x,
        associated_token::authority = taker
    )]
    pub taker_ata_x: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut, // taker must have the token he'll provide already, it only makes sense
        associated_token::mint = mint_y,
        associated_token::authority = taker
    )]
    pub taker_ata_y: InterfaceAccount<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>
}

impl<'info> Take<'info> {
    pub fn take(&mut self) -> Result<()> {
        // transfer X vault->taker
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.taker_ata_x.to_account_info(),
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

        transfer_checked(cpi_ctx, self.escrow.amount, self.mint_x.decimals)?;

        // transfer Y taker->maker
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.taker_ata_y.to_account_info(),
            to: self.maker_ata_y.to_account_info(),
            authority: self.taker.to_account_info(),
            mint: self.mint_y.to_account_info()
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // this is a stupid escrow were the amounts of X and Y are equal - will fix later
        transfer_checked(cpi_ctx, self.escrow.amount, self.mint_y.decimals)
    }
}
