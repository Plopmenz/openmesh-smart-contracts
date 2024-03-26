import { Deployer, Address } from "../../web3webdeploy/types";
import { SmartAccountsDeployment } from "./SmartAccounts";

import { deployCrossChainAccount } from "../../lib/crosschain-account/deploy/internal/CrossChainAccount";
import {
  CCIPDeployments,
  Chains,
} from "../../lib/crosschain-account/utils/ccip";

export interface DeployCrossChainDepartmentsSettings {
  smartAccounts: SmartAccountsDeployment;
  accountChainId: Chains;
  departmentChainId: Chains;
}

export interface CrossChainDepartmentsDeployment {
  disputeDepartment: Address;
  coreMemberDepartment: Address;
}

export async function deployCrossChainDepartments(
  deployer: Deployer,
  settings: DeployCrossChainDepartmentsSettings
): Promise<CrossChainDepartmentsDeployment> {
  deployer.startContext("lib/crosschain-account");
  const disputeDepartment = await deployCrossChainAccount(deployer, {
    id: "DisputeDepartmentCrossChainAccount",
    chainId: settings.accountChainId,
    originChainSelector:
      CCIPDeployments[settings.departmentChainId].chainSelector,
    originAddress: settings.smartAccounts.departments.disputeDepartment,
  });
  const coreMemberDepartment = await deployCrossChainAccount(deployer, {
    id: "CoreMemberDepartmentCrossChainAccount",
    chainId: settings.accountChainId,
    originChainSelector:
      CCIPDeployments[settings.departmentChainId].chainSelector,
    originAddress: settings.smartAccounts.departments.coreMemberDepartment,
  });
  deployer.finishContext();

  deployer.startContext("lib/openmesh-admin");
  await deployer.execute({
    id: "TransferDisputeSmartAccountOwnershipToCrossChainAccount",
    abi: await deployer.getAbi("OpenmeshAdmin"),
    to: settings.smartAccounts.departments.disputeDepartment,
    function: "transferOwnership",
    args: [disputeDepartment],
    chainId: settings.accountChainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
  });
  await deployer.execute({
    id: "TransferCoreMemberSmartAccountOwnershipToCrossChainAccount",
    abi: await deployer.getAbi("OpenmeshAdmin"),
    to: settings.smartAccounts.departments.coreMemberDepartment,
    function: "transferOwnership",
    args: [coreMemberDepartment],
    chainId: settings.accountChainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
  });
  await deployer.finishContext();

  return {
    disputeDepartment: disputeDepartment,
    coreMemberDepartment: coreMemberDepartment,
  };
}
