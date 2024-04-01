pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("CXE5bjWmUv7QAivvg6gjZTvZ246F99mCaKTNKoAuCCDc");

#[program]
pub mod peer_to_peer_betting {
    use super::*;

    // Maker creates new bet and deposits their stake
    pub fn make(ctx: Context<Make>, description: String, amount: u64) -> Result<()> {
        ctx.accounts.create_bet(description, amount, &ctx.bumps)?;
        ctx.accounts.deposit(amount)
    }

    // Maker cancels their open bet and gets refunded
    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        ctx.accounts.refund_to_maker()
    }

    // Taker accepts bet and sends their stake into the vault
    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.take_bet()
    }

    // Taker declines bet
    pub fn decline(ctx: Context<Decline>) -> Result<()> {
        ctx.accounts.decline()
    }

    // Judge settles bet
    pub fn settle_bet(ctx: Context<SettleBet>, winner: u8) -> Result<()> {
        match winner {
            1 | 2 => ctx.accounts.select_winner(winner),
            _ => ctx.accounts.refund_bet()
        }
    }
}
