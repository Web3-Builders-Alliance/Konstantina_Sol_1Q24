use anchor_lang::prelude::*;

declare_id!("7kmwXzTrcastwLt1HrVEMAgptFFnvcNCsCixHMShpcus");

#[program]
pub mod vault_a {
    use anchor_lang::system_program::{transfer, Transfer};

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.vault_state.maker = ctx.accounts.maker.key(); // we're saving the information we need into the vault state account
        ctx.accounts.vault_state.taker = ctx.accounts.taker.key();
        ctx.accounts.vault_state.state_bump = ctx.bumps.vault_state; // anchor stores the bumps found during constraint validation
        ctx.accounts.vault_state.vault_bump = ctx.bumps.vault;

        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.maker.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };

        let cpi_program = ctx.accounts.system_program.to_account_info(); // the system program is the one that does transfers

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer(cpi_ctx, amount)
    }

    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.maker.to_account_info(),
        };

        let cpi_program = ctx.accounts.system_program.to_account_info();

        // we're transfering out of a PDA so we need new_with_signer

        let bump = ctx.accounts.vault_state.vault_bump;
        let seeds = [
            "vault".as_bytes(),
            &ctx.accounts.vault_state.maker.to_bytes(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        // we want to take out all lamports from vault
        let amount = ctx.accounts.vault.to_account_info().lamports();

        transfer(cpi_ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.taker.to_account_info(),
        };

        let cpi_program = ctx.accounts.system_program.to_account_info();

        // we're transfering out of a PDA so we need new_with_signer

        let bump = ctx.accounts.vault_state.vault_bump;
        let seeds = [
            "vault".as_bytes(),
            &ctx.accounts.vault_state.maker.to_bytes(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        // we want to take out all lamports from vault
        let amount = ctx.accounts.vault.to_account_info().lamports();

        transfer(cpi_ctx, amount)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        init, // implies also mut so we don't need to add it
        seeds = [b"VaultState", maker.key().as_ref()], // vault_state is a PDA
        bump,
        payer = maker,
        space = VaultState::INIT_SPACE
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>, // is this also a pda ? yes
    pub taker: SystemAccount<'info>,
    pub system_program: Program<'info, System>
    // we don't actually need pub in front of all these variables because we have everything
    // in the lib.rs file
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump = vault_state.vault_bump // now we have the bump saved so we check that what's passed is correct
    )]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"VaultState", maker.key().as_ref()],
        bump = vault_state.state_bump,
        has_one = maker
    )]
    pub vault_state: Account<'info, VaultState>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(mut)]
    pub maker: SystemAccount<'info>, // we still need maker because the key is in the vault seeds
    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump = vault_state.vault_bump
    )]
    pub vault: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [b"VaultState", maker.key().as_ref()],
        bump = vault_state.state_bump,
        has_one = taker, // we want to have the right taker
        has_one = maker // could do without this one
    )]
    pub vault_state: Account<'info, VaultState>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Cancel<'info> {
    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump = vault_state.vault_bump,
    )]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"VaultState", maker.key().as_ref()],
        bump = vault_state.state_bump,
        has_one = maker,
        close = maker // where the lamports will go when the account is closed - whe don't we do that on vault too?
    )]
    pub vault_state: Account<'info, VaultState>,
    pub system_program: Program<'info, System>
}

// we'll have an account to store the state of the vault. The vault will be another system account
// where we'll actually store the tokens

// we use the VaultState to store the state of the vault: the taker, the maker, the bumps
// and we use that for validation purposes
// we COULD have the lamports in the vault too, using the vault_state as the vault itself as well
// but it's good prep for having a vault that isn't holding only sol but other spl tokens
// where ATAs will be required

#[account]
pub struct VaultState {
    pub maker: Pubkey, // the person who will deposit tokens in the vault
    pub taker: Pubkey, // the person allowed to withdraw tokens from the vault
    pub state_bump: u8, // the bump for the vault state account
    pub vault_bump: u8, // the bump for the vault account
}

impl Space for VaultState {
    const INIT_SPACE: usize = 8 + 32 + 32 + 1 + 1;
}
