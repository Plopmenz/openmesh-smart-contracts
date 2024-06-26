export const TagVotingSetupContract = {
  address: "0x9607461d58C1570f31DA4524d26c6bBbFC164ABC",
  abi: [
    { type: "constructor", inputs: [], stateMutability: "nonpayable" },
    {
      type: "function",
      name: "implementation",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "prepareInstallation",
      inputs: [
        { name: "_dao", type: "address", internalType: "address" },
        { name: "_data", type: "bytes", internalType: "bytes" },
      ],
      outputs: [
        { name: "plugin", type: "address", internalType: "address" },
        {
          name: "preparedSetupData",
          type: "tuple",
          internalType: "struct IPluginSetup.PreparedSetupData",
          components: [
            { name: "helpers", type: "address[]", internalType: "address[]" },
            {
              name: "permissions",
              type: "tuple[]",
              internalType: "struct PermissionLib.MultiTargetPermission[]",
              components: [
                {
                  name: "operation",
                  type: "uint8",
                  internalType: "enum PermissionLib.Operation",
                },
                { name: "where", type: "address", internalType: "address" },
                { name: "who", type: "address", internalType: "address" },
                { name: "condition", type: "address", internalType: "address" },
                {
                  name: "permissionId",
                  type: "bytes32",
                  internalType: "bytes32",
                },
              ],
            },
          ],
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "prepareUninstallation",
      inputs: [
        { name: "_dao", type: "address", internalType: "address" },
        {
          name: "_payload",
          type: "tuple",
          internalType: "struct IPluginSetup.SetupPayload",
          components: [
            { name: "plugin", type: "address", internalType: "address" },
            {
              name: "currentHelpers",
              type: "address[]",
              internalType: "address[]",
            },
            { name: "data", type: "bytes", internalType: "bytes" },
          ],
        },
      ],
      outputs: [
        {
          name: "permissions",
          type: "tuple[]",
          internalType: "struct PermissionLib.MultiTargetPermission[]",
          components: [
            {
              name: "operation",
              type: "uint8",
              internalType: "enum PermissionLib.Operation",
            },
            { name: "where", type: "address", internalType: "address" },
            { name: "who", type: "address", internalType: "address" },
            { name: "condition", type: "address", internalType: "address" },
            { name: "permissionId", type: "bytes32", internalType: "bytes32" },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "prepareUpdate",
      inputs: [
        { name: "_dao", type: "address", internalType: "address" },
        { name: "_fromBuild", type: "uint16", internalType: "uint16" },
        {
          name: "_payload",
          type: "tuple",
          internalType: "struct IPluginSetup.SetupPayload",
          components: [
            { name: "plugin", type: "address", internalType: "address" },
            {
              name: "currentHelpers",
              type: "address[]",
              internalType: "address[]",
            },
            { name: "data", type: "bytes", internalType: "bytes" },
          ],
        },
      ],
      outputs: [
        { name: "initData", type: "bytes", internalType: "bytes" },
        {
          name: "preparedSetupData",
          type: "tuple",
          internalType: "struct IPluginSetup.PreparedSetupData",
          components: [
            { name: "helpers", type: "address[]", internalType: "address[]" },
            {
              name: "permissions",
              type: "tuple[]",
              internalType: "struct PermissionLib.MultiTargetPermission[]",
              components: [
                {
                  name: "operation",
                  type: "uint8",
                  internalType: "enum PermissionLib.Operation",
                },
                { name: "where", type: "address", internalType: "address" },
                { name: "who", type: "address", internalType: "address" },
                { name: "condition", type: "address", internalType: "address" },
                {
                  name: "permissionId",
                  type: "bytes32",
                  internalType: "bytes32",
                },
              ],
            },
          ],
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "protocolVersion",
      inputs: [],
      outputs: [{ name: "", type: "uint8[3]", internalType: "uint8[3]" }],
      stateMutability: "pure",
    },
    {
      type: "function",
      name: "supportsInterface",
      inputs: [
        { name: "_interfaceId", type: "bytes4", internalType: "bytes4" },
      ],
      outputs: [{ name: "", type: "bool", internalType: "bool" }],
      stateMutability: "view",
    },
    {
      type: "error",
      name: "InvalidUpdatePath",
      inputs: [
        { name: "fromBuild", type: "uint16", internalType: "uint16" },
        { name: "thisBuild", type: "uint16", internalType: "uint16" },
      ],
    },
  ],
} as const;
