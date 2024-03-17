use anchor_lang::prelude::*;

declare_id!("8dKPLDbUaXSQs9gZzHLfMTushqChyY7AnUx2FQgzpa97");

pub mod contexts;
pub mod state;

pub use contexts::*;

#[program]
pub mod escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, amount: u64, seed: u64) -> Result<()> {
        ctx.accounts.make(amount, seed, &ctx.bumps)?;
        ctx.accounts.transfer(amount)
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.empty_vault()?;
        ctx.accounts.close_vault()
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.take()
    }
}
