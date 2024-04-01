use anchor_lang::prelude::*;

#[account]
pub struct Bet {
    pub maker: Pubkey, // needed for the taker to see
    pub opponent: Pubkey, // who the creator wants the taker to be
    pub judge: Pubkey, // who the creator proposes the judge to be
    pub amount: u64,
    pub description: String, // max length 32 bytes for now
    pub players_deposited: bool,
    pub bump: u8,
    pub vault_bump: u8,
}

impl Space for Bet {
    const INIT_SPACE: usize = 8 + 32 + 32 + 32 + 8 + (4 + 32) + 1 + 1 + 1;
}