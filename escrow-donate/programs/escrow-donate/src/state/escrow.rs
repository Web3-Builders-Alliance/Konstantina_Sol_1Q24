use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    // pub seed: u64, // dont need it bc we can use the mint see seeds in make.rs fir mukltiple escrows same maker diff mint
    pub mint: Pubkey,
    pub target: u64, // the target amount we're trying to raise
    pub bump: u8
}

impl Space for Escrow {
    const INIT_SPACE: usize = 8 + 32 + 8 + 1; // discriminator + pubkey + u64 + u8
}
