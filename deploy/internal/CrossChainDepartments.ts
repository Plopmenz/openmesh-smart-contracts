import { Deployer, Address } from "../../web3webdeploy/types";
import { SmartAccountsDeployment } from "./SmartAccounts";

import { deployCrossChainAccount } from "../../lib/crosschain-account/deploy/internal/CrossChainAccount";
import {
  CCIPDeployments,
  Chains,
} from "../../lib/crosschain-account/utils/ccip";

export interface DeployCrossChainDepartmentsSettings {
  smartAccounts: SmartAccountsDeployment;
  acountChainId: Chains;
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
    chainId: settings.acountChainId,
    originChainSelector:
      CCIPDeployments[settings.departmentChainId].chainSelector,
    originAddress: settings.smartAccounts.departments.disputeDepartment,
  });
  const coreMemberDepartment = await deployCrossChainAccount(deployer, {
    id: "CoreMemberDepartmentCrossChainAccount",
    chainId: settings.acountChainId,
    originChainSelector:
      CCIPDeployments[settings.departmentChainId].chainSelector,
    originAddress: settings.smartAccounts.departments.coreMemberDepartment,
  });
  deployer.finishContext();

  return {
    disputeDepartment: disputeDepartment,
    coreMemberDepartment: coreMemberDepartment,
  };
}
