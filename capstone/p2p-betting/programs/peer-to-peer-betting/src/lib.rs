pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("GNvd7Px5uSBF6F8a1ZtvZsjShEPDL1F93AfS8PrcweXv");

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

    // Taler accepts bet and sends their stake into the vault
    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.take_bet()
    }
}
