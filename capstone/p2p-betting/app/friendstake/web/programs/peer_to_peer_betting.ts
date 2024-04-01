export type PeerToPeerBetting = {
  "version": "0.1.0",
  "name": "peer_to_peer_betting",
  "constants": [
    {
      "name": "SEED",
      "type": "string",
      "value": "\"anchor\""
    }
  ],
  "instructions": [
    {
      "name": "make",
      "accounts": [
        {
          "name": "maker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "opponent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "judge",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancel",
      "accounts": [
        {
          "name": "maker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "opponent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "judge",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "take",
      "accounts": [
        {
          "name": "opponent",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "maker",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "judge",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "decline",
      "accounts": [
        {
          "name": "opponent",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "maker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "settleBet",
      "accounts": [
        {
          "name": "judge",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "maker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "taker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "winner",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maker",
            "type": "publicKey"
          },
          {
            "name": "opponent",
            "type": "publicKey"
          },
          {
            "name": "judge",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "state",
            "type": {
              "defined": "State"
            }
          },
          {
            "name": "winner",
            "type": {
              "defined": "Winner"
            }
          },
          {
            "name": "playersDeposited",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Winner",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Maker"
          },
          {
            "name": "Taker"
          }
        ]
      }
    },
    {
      "name": "State",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Cancelled"
          },
          {
            "name": "Accepted"
          },
          {
            "name": "Settled"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "TakerAlreadyDeposited",
      "msg": "The taker has already deposited"
    },
    {
      "code": 6001,
      "name": "PlayersNotDeposited",
      "msg": "Not both players have sent their deposit"
    }
  ]
};

export const IDL: PeerToPeerBetting = {
  "version": "0.1.0",
  "name": "peer_to_peer_betting",
  "constants": [
    {
      "name": "SEED",
      "type": "string",
      "value": "\"anchor\""
    }
  ],
  "instructions": [
    {
      "name": "make",
      "accounts": [
        {
          "name": "maker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "opponent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "judge",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancel",
      "accounts": [
        {
          "name": "maker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "opponent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "judge",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "take",
      "accounts": [
        {
          "name": "opponent",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "maker",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "judge",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "decline",
      "accounts": [
        {
          "name": "opponent",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "maker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "settleBet",
      "accounts": [
        {
          "name": "judge",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "maker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "taker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "winner",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maker",
            "type": "publicKey"
          },
          {
            "name": "opponent",
            "type": "publicKey"
          },
          {
            "name": "judge",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "state",
            "type": {
              "defined": "State"
            }
          },
          {
            "name": "winner",
            "type": {
              "defined": "Winner"
            }
          },
          {
            "name": "playersDeposited",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Winner",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Maker"
          },
          {
            "name": "Taker"
          }
        ]
      }
    },
    {
      "name": "State",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Cancelled"
          },
          {
            "name": "Accepted"
          },
          {
            "name": "Settled"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "TakerAlreadyDeposited",
      "msg": "The taker has already deposited"
    },
    {
      "code": 6001,
      "name": "PlayersNotDeposited",
      "msg": "Not both players have sent their deposit"
    }
  ]
};
