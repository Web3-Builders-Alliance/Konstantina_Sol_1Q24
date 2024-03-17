use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    pub seed: u64, // so that the maker can create > 1 escrows for the same mints?
    pub mint_x: Pubkey, // the mint maker is depositing
    pub mint_y: Pubkey, // the mint maker is asking in return
    pub amount: u64, // the amount of mint_y they're asking
    pub bump: u8
}

impl Space for Escrow {
    const INIT_SPACE: usize = 8 + 8 + 32 + 32 + 8 + 1;
}