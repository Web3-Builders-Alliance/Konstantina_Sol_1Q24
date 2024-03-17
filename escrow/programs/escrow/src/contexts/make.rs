use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{transfer_checked, TransferChecked}, token_interface::{Mint, TokenAccount, TokenInterface}};

use crate::state::Escrow;

#[derive(Accounts)]
#[instruction(amount: u64, seed: u64)]
// #[instruction(seed: u64)]
// ^ This was causing seeds constraints violation because:
// seed is the second argument in the instruction and they need to
// be in order in the instruction macro in accounts
// only the unused in the end can be omitted
pub struct Make<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        init,
        payer = maker,
        seeds = [
            b"escrow",
            maker.key().as_ref(),
            seed.to_le_bytes().as_ref()
        ],
        space = Escrow::INIT_SPACE,
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    pub mint_x: InterfaceAccount<'info, Mint>,
    pub mint_y: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = maker,
        // here we used associated_token constraints with init because we're ok with
        // mint_x and escrow being the seeds, we don't want to specify something different
        // or we'd have to use token::mint and token::authority
        // associated_token constraints, will use the mint and authority as seeds
        // token constraints will just enforce that mint and authority matches, therefore we can use seeds constraints as well
        associated_token::mint = mint_x,
        associated_token::authority = escrow
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut, // if the maker is depositing mint_x they need to already have an ata for it
        associated_token::mint = mint_x,
        associated_token::authority = maker
    )]
    pub maker_ata_x: InterfaceAccount<'info, TokenAccount>,
    // why do we need a maker ata for token y already in make?
    // so the maker pays for the creation for their own ata and not the taker
    #[account(
        init_if_needed,
        payer = maker,
        associated_token::mint = mint_y,
        associated_token::authority = maker
    )]
    pub maker_ata_y: InterfaceAccount<'info, TokenAccount>,
    // idk why we AccountInfo<'info> the programs in the vid and not Program<>
    // but use of AccountInfo needs a CHECK comment like UncheckedAccount
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>
}

impl<'info> Make<'info> { // think of thes impls as methods for the "Make class"
    pub fn make(&mut self, amount: u64, seed: u64, bumps: &MakeBumps) -> Result<()> {
        // the MakeBumps is created by ancor automatically
        // NameofthecontextstructBumps with all the bumps it finds created in validation

        self.escrow.set_inner(Escrow {
            seed,
            mint_x: self.mint_x.to_account_info().key(),
            mint_y: self.mint_y.to_account_info().key(),
            amount,
            bump: bumps.escrow
        });

        Ok(())
    }

    pub fn transfer(&mut self, deposit: u64) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        // is TransferChecked just because we're using TokenInterface? yes
        let cpi_accounts = TransferChecked {
            from: self.maker_ata_x.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.maker.to_account_info(),
            mint: self.mint_x.to_account_info()
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer_checked(cpi_ctx, deposit, self.mint_x.decimals)
    }
}
