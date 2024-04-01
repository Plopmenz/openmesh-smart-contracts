import { Deployer, Address } from "../../web3webdeploy/types";
import { getChainSettings } from "../deploy";

import { deployCrossChainAccount } from "../../lib/crosschain-account/deploy/internal/CrossChainAccount";
import {
  CCIPDeployments,
  Chains,
} from "../../lib/crosschain-account/utils/ccip";
import { SmartAccountsDeployment } from "./SmartAccounts";
import { SmartAccountBaseContract } from "../../lib/openmesh-admin/lib/smart-account/export/SmartAccountBase";
import { SmartAccountBaseInstallerContract } from "../../lib/openmesh-admin/lib/smart-account/export/Mumbai/SmartAccountBaseInstaller";

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
  const openmeshAdminAbi = [...SmartAccountBaseContract.abi]; // await deployer.getAbi("OpenmeshAdmin");
  const transferOwnershipArgs = (newOwner: Address) => {
    return [
      SmartAccountBaseInstallerContract.address,
      deployer.viem.encodeFunctionData({
        abi: SmartAccountBaseInstallerContract.abi,
        functionName: "transferOwnership",
        args: [newOwner],
      }),
    ];
  };
  await deployer.execute({
    id: "TransferDisputeSmartAccountOwnershipToCrossChainAccount",
    abi: openmeshAdminAbi,
    to: settings.smartAccounts.departments.disputeDepartment,
    function: "performDelegateCall",
    args: transferOwnershipArgs(disputeDepartment),
    chainId: settings.accountChainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
    ...getChainSettings(settings.accountChainId),
  });
  await deployer.execute({
    id: "TransferCoreMemberSmartAccountOwnershipToCrossChainAccount",
    abi: openmeshAdminAbi,
    to: settings.smartAccounts.departments.coreMemberDepartment,
    function: "performDelegateCall",
    args: transferOwnershipArgs(coreMemberDepartment),
    chainId: settings.accountChainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
    ...getChainSettings(settings.accountChainId),
  });
  await deployer.execute({
    id: "TransferExpertSmartAccountOwnershipToCrossChainAccount",
    abi: openmeshAdminAbi,
    to: settings.smartAccounts.departments.expertDepartment,
    function: "performDelegateCall",
    args: transferOwnershipArgs(expertDepartment),
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
