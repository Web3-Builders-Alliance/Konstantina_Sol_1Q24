use anchor_lang::prelude::*;

declare_id!("4Rpr3wujcbhs7SRm7PYX9BHNcQmkss57UQfyZA36qDAf");

pub mod state;
pub mod contexts;

pub use contexts::*;

// Maker wants to collect a certain amount of donations / raise funding
// Maker will create an escrow to allow people to make donations
// Once the amount is reached, the value will be transferred to the Maker

#[program]
pub mod escrow_donate {
    use super::*;

    pub fn make(ctx: Context<Make>, amount: u64) -> Result<()> {
        ctx.accounts.make(amount, &ctx.bumps)

        // or
        // ctx.accounts.make(amount, &ctx.bumps)?;
        // Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
