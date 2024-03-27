use anchor_lang::{prelude::*, system_program::{transfer, Transfer}};

use crate::{state::Bet, State};

#[derive(Accounts)]
pub struct Take<'info> {
    #[account(mut)]
    pub opponent: Signer<'info>, // the taker
    /// CHECK: this is fine
    pub maker: UncheckedAccount<'info>,
    /// CHECK: this is fine
    pub judge: UncheckedAccount<'info>,
    #[account(
        mut,
        has_one = opponent, // important so only the determined opponent can be the taker
        has_one = judge,
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

impl <'info> Take<'info> {
    pub fn take_bet(&mut self) -> Result<()> {

        // Mark bet as accepted
        self.bet.state = State::Accepted;

        // Deposit into the vault
        let accounts = Transfer {
            from: self.opponent.to_account_info(),
            to: self.vault.to_account_info()
        };

        let ctx = CpiContext::new(self.system_program.to_account_info(), accounts);

        transfer(ctx, self.bet.amount)
    }
}
