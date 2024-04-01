export const SmartAccountTaskDisputeInstaller_80001Contract = {
  address: "0x5D24BaD9455EaFCC196834Ff92E4F77e244dcFCb",
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
          name: "_addressTrustlessManagement",
          type: "address",
          internalType: "contract ITrustlessManagement",
        },
        {
          name: "_trustlessActions",
          type: "address",
          internalType: "contract ITrustlessActions",
        },
        {
          name: "_taskDisputes",
          type: "address",
          internalType: "contract IPaidAction",
        },
        { name: "_tasks", type: "address", internalType: "contract ITasks" },
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
      name: "fullInstall",
      inputs: [{ name: "_cost", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "fullUninstall",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "paidAction",
      inputs: [],
      outputs: [
        { name: "", type: "address", internalType: "contract IPaidAction" },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "permissionsInstall",
      inputs: [{ name: "_cost", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "permissionsUninstall",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
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
      name: "tasks",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "contract ITasks" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "trustlessActions",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract ITrustlessActions",
        },
      ],
      stateMutability: "view",
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
