export const SmartAccountDepartmentInstallerContract = {
  address: "0x811737b560Cb769336f3188de8e2e5465107dA81",
  abi: [
    {
      type: "constructor",
      inputs: [
        {
          name: "_smartAccountTrustlessExecution",
          type: "address",
          internalType: "contract ISmartAccountTrustlessExecution",
        },
        {
          name: "_tagTrustlessManagement",
          type: "address",
          internalType: "contract ITrustlessManagement",
        },
        {
          name: "_addressTrustlessManagement",
          type: "address",
          internalType: "contract ITrustlessManagement",
        },
        {
          name: "_optimisticActions",
          type: "address",
          internalType: "contract IOptimisticActions",
        },
        { name: "_openRD", type: "address", internalType: "address" },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "addressTrustlessManagement",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract ITrustlessManagement",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "install",
      inputs: [{ name: "_tag", type: "bytes32", internalType: "bytes32" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "openRD",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "optimisticActions",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract IOptimisticActions",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "smartAccountTrustlessExecution",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract ISmartAccountTrustlessExecution",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "tagTrustlessManagement",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract ITrustlessManagement",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "event",
      name: "DepartmentInstalled",
      inputs: [
        {
          name: "department",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "tag",
          type: "bytes32",
          indexed: true,
          internalType: "bytes32",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "ExecutePermissionSet",
      inputs: [
        {
          name: "account",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        { name: "allowed", type: "bool", indexed: false, internalType: "bool" },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "InterfaceSupportedChanged",
      inputs: [
        {
          name: "interfaceId",
          type: "bytes4",
          indexed: true,
          internalType: "bytes4",
        },
        {
          name: "supported",
          type: "bool",
          indexed: false,
          internalType: "bool",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "ModuleSet",
      inputs: [
        {
          name: "functionSelector",
          type: "bytes4",
          indexed: false,
          internalType: "bytes4",
        },
        {
          name: "module",
          type: "address",
          indexed: false,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
  ],
} as const;
