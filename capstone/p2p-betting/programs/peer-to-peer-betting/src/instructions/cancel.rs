use anchor_lang::{prelude::*, system_program::{transfer, Transfer}};

use crate::state::Bet;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct Cancel<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    /// CHECK: this is fine
    pub opponent: UncheckedAccount<'info>,
    /// CHECK: this is fine
    pub judge: UncheckedAccount<'info>,
    #[account(
        mut,
        close = maker,
        has_one = opponent,
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

impl <'info> Cancel<'info> {
    pub fn refund_to_maker(&mut self) -> Result<()> {
        // if the opponent has already sent their deposit, the maker shouldn't be able to cancel

        if self.bet.players_deposited {
            return Err(ErrorCode::TakerAlreadyDeposited.into());
        }

        let cpi_program = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.maker.to_account_info(),
        };

        // let opponent = self.bet.opponent.key();
        // let judge = self.bet.judge.key();
        // let seeds = [
        //     b"bet",
        //     self.maker.key.as_ref(),
        //     self.opponent.key.as_ref(),
        //     self.judge.key.as_ref(),
        //     self.bet.description.as_str().as_bytes(),
        //     &[self.bet.bump]
        // ];

        // the vault needs to sign here, not the bet/escrow account!
        let bet_key = self.bet.key();
        let seeds = [
            b"vault",
            bet_key.as_ref(),
            &[self.bet.vault_bump]
        ];

        let signer_seeds: &[&[&[u8]]; 1] = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer(cpi_ctx, self.bet.amount)
    }

    // we don't need to do that because vault is a system account - we just empty it
    // pub fn close_account(&mut self) -> Result<()> {
    //     let cpi_program = self.system_program.to_account_info();

    //     let cpi_accounts = CloseAccount {
    //         account: self.vault.to_account_info(),
    //         destination: self.maker.to_account_info(),
    //         authority: self.bet.to_account_info(),
    //     };

    //     let bet_key = self.bet.key();
    //     let seeds = [
    //         b"vault",
    //         bet_key.as_ref(),
    //         &[self.bet.vault_bump]
    //     ];

    //     let signer_seeds: &[&[&[u8]]; 1] = &[&seeds[..]];

    //     let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

    //     close_account(cpi_ctx)
    // }
}
