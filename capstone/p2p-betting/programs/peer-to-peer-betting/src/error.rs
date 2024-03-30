use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("The taker has already deposited")]
    TakerAlreadyDeposited,
    #[msg("Not both players have sent their deposit")]
    PlayersNotDeposited,
}
