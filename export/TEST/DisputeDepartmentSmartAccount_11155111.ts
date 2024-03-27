export const DisputeDepartmentSmartAccount_11155111Contract = {"address":"0x8236E099826551b3e576643dc3CA3B6a005AFAe9","abi":[{"type":"constructor","inputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"multicall","inputs":[{"name":"data","type":"bytes[]","internalType":"bytes[]"}],"outputs":[{"name":"results","type":"bytes[]","internalType":"bytes[]"}],"stateMutability":"nonpayable"},{"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"performCall","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"},{"name":"data","type":"bytes","internalType":"bytes"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"},{"name":"returnValue","type":"bytes","internalType":"bytes"}],"stateMutability":"nonpayable"},{"type":"function","name":"performDelegateCall","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"data","type":"bytes","internalType":"bytes"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"},{"name":"returnValue","type":"bytes","internalType":"bytes"}],"stateMutability":"nonpayable"},{"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"event","name":"OwnershipTransferred","inputs":[{"name":"previousOwner","type":"address","indexed":true,"internalType":"address"},{"name":"newOwner","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"error","name":"AddressEmptyCode","inputs":[{"name":"target","type":"address","internalType":"address"}]},{"type":"error","name":"FailedInnerCall","inputs":[]},{"type":"error","name":"OwnableInvalidOwner","inputs":[{"name":"owner","type":"address","internalType":"address"}]},{"type":"error","name":"OwnableUnauthorizedAccount","inputs":[{"name":"account","type":"address","internalType":"address"}]}]} as const;