use anchor_lang::{prelude::*, system_program::{transfer, Transfer}};

use crate::state::Bet;

// settle bet: the judge either selects the winner or cancels the bet and players get refunded

#[derive(Accounts)]
pub struct SettleBet<'info> {
    #[account(mut)]
    pub judge: Signer<'info>,
    #[account(mut)]
    pub maker: SystemAccount<'info>,
    #[account(mut)]
    pub taker: SystemAccount<'info>,
    #[account(
        mut,
        close = maker,
        has_one = judge, // important so only the judge can settle the bet!
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

impl <'info> SettleBet<'info> {
    pub fn select_winner(&mut self, winner : u8) -> Result<()> {
        // send vault balance to the winner
        let recipient = match winner {
            // maker
            1 => self.maker.clone(),
            // taker
            2 => self.taker.clone(),
            _ => panic!("shouldn't get here"),
        };

        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: recipient.to_account_info(),
        };

        let bet_key = self.bet.key();
        let seeds = [
            b"vault",
            bet_key.as_ref(),
            &[self.bet.vault_bump]
        ];

        let signer_seeds: &[&[&[u8]]; 1] = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        let amount = self.vault.to_account_info().lamports(); // should be self.bet.amount * 2

        transfer(cpi_ctx, amount)
    }

    pub fn refund_bet(&mut self) -> Result<()> {
        let cpi_program = self.system_program.to_account_info();

        let bet_key = self.bet.key();
        let seeds = [
            b"vault",
            bet_key.as_ref(),
            &[self.bet.vault_bump]
        ];

        let signer_seeds: &[&[&[u8]]; 1] = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.maker.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer(cpi_ctx, self.bet.amount)?; // refund to maker

        let cpi_program = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.taker.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer(cpi_ctx, self.bet.amount) // refund to taker
    }
}
