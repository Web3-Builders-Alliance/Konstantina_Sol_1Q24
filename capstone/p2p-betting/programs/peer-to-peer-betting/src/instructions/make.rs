use anchor_lang::{prelude::*, system_program::{transfer, Transfer}};

use crate::state::Bet;

#[derive(Accounts)]
#[instruction(description: String)]
pub struct Make<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    /// CHECK: this is fine
    pub opponent: UncheckedAccount<'info>,
    /// CHECK: this is fine
    pub judge: UncheckedAccount<'info>,
    #[account(
        init,
        payer = maker,
        space = Bet::INIT_SPACE,
        seeds = [
            b"bet",
            maker.key().as_ref(),
            opponent.key().as_ref(),
            judge.key().as_ref(),
            description.as_str().as_bytes()
        ],
        bump
    )]
    pub bet: Account<'info, Bet>,
    #[account(
        mut, // we'll be transferring!
        // error when not mut: Cross-program invocation with unauthorized signer or writable account
        seeds = [
            b"vault",
            bet.key().as_ref(),
        ],
        bump
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>
}

impl <'info> Make<'info> {
    pub fn create_bet(&mut self, description: String, amount: u64, bumps: &MakeBumps) -> Result<()> {
        self.bet.maker = self.maker.key();
        self.bet.opponent = self.opponent.key();
        self.bet.judge = self.judge.key();
        self.bet.amount = amount;
        self.bet.description = description;
        self.bet.bump = bumps.bet;
        self.bet.vault_bump = bumps.vault;

        Ok(())
    }

    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        let accounts = Transfer {
            from: self.maker.to_account_info(),
            to: self.vault.to_account_info()
        };

        let ctx = CpiContext::new(self.system_program.to_account_info(), accounts);

        transfer(ctx, amount)
    }
}
