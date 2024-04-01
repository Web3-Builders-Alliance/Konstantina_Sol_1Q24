use anchor_lang::{prelude::*, system_program::{transfer, Transfer}};

use crate::{state::Bet, error::ErrorCode};

#[derive(Accounts)]
pub struct Decline<'info> {
    #[account(mut)]
    pub opponent: Signer<'info>, // the taker
    /// CHECK: this is fine
    #[account(mut)]
    pub maker: UncheckedAccount<'info>,
    #[account(
        mut,
        has_one = opponent,
        close = maker,
        seeds = [
            b"bet",
            bet.maker.key().as_ref(),
            bet.opponent.key().as_ref(),
            bet.judge.key().as_ref(),
            bet.description.as_str().as_bytes()
        ],
        bump = bet.bump
    )]
    pub bet: Account<'info, Bet>,
    #[account(
        mut,
        seeds = [
            b"vault",
            bet.key().as_ref(),
        ],
        bump = bet.vault_bump
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>
}

impl <'info> Decline<'info> {
    pub fn decline(&mut self) -> Result<()> {
        // if the taker has already accepted they can't then cancel
        if self.bet.players_deposited {
            return Err(ErrorCode::TakerAlreadyDeposited.into());
        }

        let cpi_program = self.system_program.to_account_info();

        let bet_key = self.bet.key();
        let seeds = [
            b"vault",
            bet_key.as_ref(),
            &[self.bet.vault_bump]
        ];

        let signer_seeds: &[&[&[u8]]] = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.maker.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer(cpi_ctx, self.bet.amount)
    }
}
