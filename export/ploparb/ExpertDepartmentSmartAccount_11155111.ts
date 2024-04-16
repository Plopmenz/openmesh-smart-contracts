export const ExpertDepartmentSmartAccount_11155111Contract = {
  address: "0x8765a0779c72C12C2e0Ce22fac3f21932C93088a",
  abi: [
    { type: "constructor", inputs: [], stateMutability: "nonpayable" },
    { type: "fallback", stateMutability: "payable" },
    { type: "receive", stateMutability: "payable" },
    {
      type: "function",
      name: "multicall",
      inputs: [{ name: "data", type: "bytes[]", internalType: "bytes[]" }],
      outputs: [{ name: "results", type: "bytes[]", internalType: "bytes[]" }],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "performCall",
      inputs: [
        { name: "to", type: "address", internalType: "address" },
        { name: "value", type: "uint256", internalType: "uint256" },
        { name: "data", type: "bytes", internalType: "bytes" },
      ],
      outputs: [{ name: "returnValue", type: "bytes", internalType: "bytes" }],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "performDelegateCall",
      inputs: [
        { name: "to", type: "address", internalType: "address" },
        { name: "data", type: "bytes", internalType: "bytes" },
      ],
      outputs: [{ name: "returnValue", type: "bytes", internalType: "bytes" }],
      stateMutability: "nonpayable",
    },
    {
      type: "error",
      name: "AddressEmptyCode",
      inputs: [{ name: "target", type: "address", internalType: "address" }],
    },
    {
      type: "error",
      name: "AddressInsufficientBalance",
      inputs: [{ name: "account", type: "address", internalType: "address" }],
    },
    { type: "error", name: "FailedInnerCall", inputs: [] },
    {
      type: "error",
      name: "FunctionNotFound",
      inputs: [
        { name: "functionSelector", type: "bytes4", internalType: "bytes4" },
      ],
    },
    {
      type: "error",
      name: "NotOwner",
      inputs: [
        { name: "account", type: "address", internalType: "address" },
        { name: "owner", type: "address", internalType: "address" },
      ],
    },
  ],
} as const;
