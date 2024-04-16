export const DepartmentFactoryContract = {
  address: "0x1F3fCCceC909050c452574C5A52168bf89e896A0",
  abi: [
    {
      type: "constructor",
      inputs: [
        {
          name: "_pluginSetupProcessor",
          type: "address",
          internalType: "contract PluginSetupProcessor",
        },
        {
          name: "_aragonTagVoting",
          type: "address",
          internalType: "contract PluginRepo",
        },
        {
          name: "_tagManager",
          type: "address",
          internalType: "contract ERC721TagManager",
        },
        {
          name: "_departmentOwnerSettings",
          type: "tuple",
          internalType: "struct DepartmentFactory.DepartmentOwnerSettings",
          components: [
            { name: "metadata", type: "bytes", internalType: "bytes" },
            {
              name: "tokenVoting",
              type: "address",
              internalType: "contract PluginRepo",
            },
            {
              name: "token",
              type: "address",
              internalType: "contract IVerifiedContributor",
            },
            {
              name: "trustlessManagement",
              type: "address",
              internalType: "contract ITrustlessManagement",
            },
            { name: "role", type: "uint256", internalType: "uint256" },
            {
              name: "addressTrustlessManagement",
              type: "address",
              internalType: "contract ITrustlessManagement",
            },
            {
              name: "optimisticActions",
              type: "address",
              internalType: "contract IOptimisticActions",
            },
          ],
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "aragonTagVoting",
      inputs: [],
      outputs: [
        { name: "", type: "address", internalType: "contract PluginRepo" },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "createDepartment",
      inputs: [
        { name: "_metadata", type: "bytes", internalType: "bytes" },
        { name: "_tag", type: "bytes32", internalType: "bytes32" },
      ],
      outputs: [
        { name: "createdDao", type: "address", internalType: "contract DAO" },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "daoBase",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
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
      name: "pluginSetupProcessor",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract PluginSetupProcessor",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "tagManager",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract ERC721TagManager",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "event",
      name: "DepartmentCreated",
      inputs: [
        {
          name: "department",
          type: "address",
          indexed: false,
          internalType: "contract IDAO",
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
      name: "DepartmentOwnerCreated",
      inputs: [
        {
          name: "departmentOwner",
          type: "address",
          indexed: false,
          internalType: "contract IDAO",
        },
      ],
      anonymous: false,
    },
  ],
} as const;
