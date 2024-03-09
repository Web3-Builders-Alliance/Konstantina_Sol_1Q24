use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{Mint, Token, TokenAccount}};
use crate::state::Escrow;

// the accounts sturct implement serialize and deserialize in the accounts we pass
// and also allows us to use accounts constraints
#[derive(Accounts)]
pub struct Make<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = maker,
        associated_token::mint = mint,
        associated_token::authority = maker,
    )]
    pub maker_ata: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = maker,
        seeds = [
            b"escrow",
            maker.key().as_ref(),
            mint.key().as_ref() // so that the same maker can create a diff escrow with a diff mint
        ],
        bump,
        space = Escrow::INIT_SPACE,
    )]
    pub escrow: Account<'info, Escrow>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}

impl<'info> Make<'info> {
    pub fn make(&mut self, amount: u64, bumps: &MakeBumps) -> Result<()> {
        // anchor creates MakeBumps and checks if there are bumps initialized in your constraints and stores them in MakeBumps for you automatically

        self.escrow.mint = self.mint.key(); // or *self.mint.key
        self.escrow.target = amount;
        self.escrow.bump = bumps.escrow;

        msg!("Escrow account created"); // .anchor/program-logs
        msg!("Escrow mint: {}", self.escrow.mint);
        msg!("Escrow target: {}", self.escrow.target);

        Ok(())
    }
}