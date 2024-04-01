export const VerifiedContributorTagManagerContract = {
  address: "0x339cFED035F30A5155AAD4964565E8BdD7f70f0b",
  abi: [
    {
      type: "constructor",
      inputs: [
        {
          name: "_collection",
          type: "address",
          internalType: "contract IERC721",
        },
        { name: "_admin", type: "address", internalType: "address" },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "DEFAULT_ADMIN_ROLE",
      inputs: [],
      outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "addTag",
      inputs: [
        { name: "tokenId", type: "uint256", internalType: "uint256" },
        { name: "tag", type: "bytes32", internalType: "bytes32" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getRoleAdmin",
      inputs: [{ name: "role", type: "bytes32", internalType: "bytes32" }],
      outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "grantRole",
      inputs: [
        { name: "role", type: "bytes32", internalType: "bytes32" },
        { name: "account", type: "address", internalType: "address" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "hasRole",
      inputs: [
        { name: "role", type: "bytes32", internalType: "bytes32" },
        { name: "account", type: "address", internalType: "address" },
      ],
      outputs: [{ name: "", type: "bool", internalType: "bool" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "hasTag",
      inputs: [
        { name: "account", type: "address", internalType: "address" },
        { name: "tag", type: "bytes32", internalType: "bytes32" },
      ],
      outputs: [{ name: "", type: "bool", internalType: "bool" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "owner",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "pure",
    },
    {
      type: "function",
      name: "removeTag",
      inputs: [
        { name: "tokenId", type: "uint256", internalType: "uint256" },
        { name: "tag", type: "bytes32", internalType: "bytes32" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "removeTagFromBurnedToken",
      inputs: [
        { name: "tokenId", type: "uint256", internalType: "uint256" },
        { name: "tag", type: "bytes32", internalType: "bytes32" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "renounceRole",
      inputs: [
        { name: "role", type: "bytes32", internalType: "bytes32" },
        {
          name: "callerConfirmation",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "revokeRole",
      inputs: [
        { name: "role", type: "bytes32", internalType: "bytes32" },
        { name: "account", type: "address", internalType: "address" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setId",
      inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setRoleAdmin",
      inputs: [
        { name: "role", type: "bytes32", internalType: "bytes32" },
        { name: "adminRole", type: "bytes32", internalType: "bytes32" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "supportsInterface",
      inputs: [{ name: "interfaceId", type: "bytes4", internalType: "bytes4" }],
      outputs: [{ name: "", type: "bool", internalType: "bool" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "totalTagHavers",
      inputs: [{ name: "tag", type: "bytes32", internalType: "bytes32" }],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "event",
      name: "RoleAdminChanged",
      inputs: [
        {
          name: "role",
          type: "bytes32",
          indexed: true,
          internalType: "bytes32",
        },
        {
          name: "previousAdminRole",
          type: "bytes32",
          indexed: true,
          internalType: "bytes32",
        },
        {
          name: "newAdminRole",
          type: "bytes32",
          indexed: true,
          internalType: "bytes32",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "RoleGranted",
      inputs: [
        {
          name: "role",
          type: "bytes32",
          indexed: true,
          internalType: "bytes32",
        },
        {
          name: "account",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "sender",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "RoleRevoked",
      inputs: [
        {
          name: "role",
          type: "bytes32",
          indexed: true,
          internalType: "bytes32",
        },
        {
          name: "account",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "sender",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "TagAdded",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "tag",
          type: "bytes32",
          indexed: false,
          internalType: "bytes32",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "TagRemoved",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "tag",
          type: "bytes32",
          indexed: false,
          internalType: "bytes32",
        },
      ],
      anonymous: false,
    },
    { type: "error", name: "AccessControlBadConfirmation", inputs: [] },
    {
      type: "error",
      name: "AccessControlUnauthorizedAccount",
      inputs: [
        { name: "account", type: "address", internalType: "address" },
        { name: "neededRole", type: "bytes32", internalType: "bytes32" },
      ],
    },
    {
      type: "error",
      name: "AlreadyTagged",
      inputs: [
        { name: "tokenId", type: "uint256", internalType: "uint256" },
        { name: "tag", type: "bytes32", internalType: "bytes32" },
      ],
    },
    {
      type: "error",
      name: "NotTagged",
      inputs: [
        { name: "tokenId", type: "uint256", internalType: "uint256" },
        { name: "tag", type: "bytes32", internalType: "bytes32" },
      ],
    },
    {
      type: "error",
      name: "TokenNotBurned",
      inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    },
  ],
} as const;
