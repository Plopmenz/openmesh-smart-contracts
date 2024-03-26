import { Deployer, Address } from "../../web3webdeploy/types";
import { multiDeploy } from "../deploy";

import {
  OpenmeshAdminDeployment,
  deploy as openmeshAdminDeploy,
} from "../../lib/openmesh-admin/deploy/deploy";
import { deployAdmin } from "../../lib/openmesh-admin/deploy/internal/OpenmeshAdmin";

export interface DeploySmartAccountsSettings {
  chains: number[];
}

export interface SmartAccountsDeployment {
  openmeshAdmin: OpenmeshAdminDeployment;
  departments: {
    disputeDepartment: Address;
    coreMemberDepartment: Address;
  };
}

export async function deploySmartAccounts(
  deployer: Deployer,
  settings: DeploySmartAccountsSettings
): Promise<SmartAccountsDeployment> {
  deployer.startContext("lib/openmesh-admin");
  const openmeshAdmin = await multiDeploy(
    (chainId) =>
      openmeshAdminDeploy(deployer, {
        adminSettings: { chainId: chainId },
      }),
    settings.chains
  );
  const disputeDepartment = await multiDeploy(
    (chainId) =>
      deployAdmin(deployer, {
        id: "DisputeDepartmentSmartAccount",
        chainId: chainId,
        salt: "DISPUTE",
      }),
    settings.chains
  );
  const coreMemberDepartment = await multiDeploy(
    (chainId) =>
      deployAdmin(deployer, {
        id: "CoreMemberDepartmentSmartAccount",
        chainId: chainId,
        salt: "COREMEMBER",
      }),
    settings.chains
  );
  deployer.finishContext();

  return {
    openmeshAdmin: openmeshAdmin,
    departments: {
      disputeDepartment: disputeDepartment,
      coreMemberDepartment: coreMemberDepartment,
    },
  };
}
