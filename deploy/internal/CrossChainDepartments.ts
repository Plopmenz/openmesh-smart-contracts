import { Deployer, Address } from "../../web3webdeploy/types";
import { SmartAccountsDeployment } from "./SmartAccounts";

import { deployCrossChainAccount } from "../../lib/crosschain-account/deploy/internal/CrossChainAccount";
import {
  CCIPDeployments,
  Chains,
} from "../../lib/crosschain-account/utils/ccip";
import { getChainSettings } from "../deploy";

export interface DeployCrossChainDepartmentsSettings {
  smartAccounts: SmartAccountsDeployment;
  accountChainId: Chains;
  departmentChainId: Chains;
}

export interface CrossChainDepartmentsDeployment {
  disputeDepartment: Address;
  coreMemberDepartment: Address;
  expertDepartment: Address;
}

export async function deployCrossChainDepartments(
  deployer: Deployer,
  settings: DeployCrossChainDepartmentsSettings
): Promise<CrossChainDepartmentsDeployment> {
  deployer.startContext("lib/crosschain-account");
  const disputeDepartment = await deployCrossChainAccount(deployer, {
    id: "DisputeDepartmentCrossChainAccount",
    originChainSelector:
      CCIPDeployments[settings.departmentChainId].chainSelector,
    originAddress: settings.smartAccounts.departments.disputeDepartment,
    chainId: settings.accountChainId,
    ...getChainSettings(settings.accountChainId),
  });
  const coreMemberDepartment = await deployCrossChainAccount(deployer, {
    id: "CoreMemberDepartmentCrossChainAccount",
    originChainSelector:
      CCIPDeployments[settings.departmentChainId].chainSelector,
    originAddress: settings.smartAccounts.departments.coreMemberDepartment,
    chainId: settings.accountChainId,
    ...getChainSettings(settings.accountChainId),
  });
  const expertDepartment = await deployCrossChainAccount(deployer, {
    id: "ExpertDepartmentCrossChainAccount",
    originChainSelector:
      CCIPDeployments[settings.departmentChainId].chainSelector,
    originAddress: settings.smartAccounts.departments.expertDepartment,
    chainId: settings.accountChainId,
    ...getChainSettings(settings.accountChainId),
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
    ...getChainSettings(settings.accountChainId),
  });
  await deployer.execute({
    id: "TransferCoreMemberSmartAccountOwnershipToCrossChainAccount",
    abi: await deployer.getAbi("OpenmeshAdmin"),
    to: settings.smartAccounts.departments.coreMemberDepartment,
    function: "transferOwnership",
    args: [coreMemberDepartment],
    chainId: settings.accountChainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
    ...getChainSettings(settings.accountChainId),
  });
  await deployer.execute({
    id: "TransferExpertSmartAccountOwnershipToCrossChainAccount",
    abi: await deployer.getAbi("OpenmeshAdmin"),
    to: settings.smartAccounts.departments.expertDepartment,
    function: "transferOwnership",
    args: [expertDepartment],
    chainId: settings.accountChainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
    ...getChainSettings(settings.accountChainId),
  });
  await deployer.finishContext();

  return {
    disputeDepartment: disputeDepartment,
    coreMemberDepartment: coreMemberDepartment,
    expertDepartment: expertDepartment,
  };
}
