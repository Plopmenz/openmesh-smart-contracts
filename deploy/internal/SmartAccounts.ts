import { Deployer, Address } from "../../web3webdeploy/types";
import { getChainSettings, multiDeploy } from "../deploy";

import {
  OpenmeshAdminDeployment,
  deploy as openmeshAdminDeploy,
} from "../../lib/openmesh-admin/deploy/deploy";
import { deployAdmin } from "../../lib/openmesh-admin/deploy/internal/OpenmeshAdmin";
import { deployPessimisticActions } from "../../lib/trustless-actions/deploy/internal/PessimisticActions";
import { DepartmentTags } from "./Departments";
import { OpenRDDeployment } from "./OpenRD";
import { SmartAccountTrustlessExecutionContract } from "../../lib/openmesh-admin/lib/smart-account/export/Mumbai/SmartAccountTrustlessExecution";
import { SmartAccountBaseContract } from "../../lib/openmesh-admin/lib/smart-account/export/SmartAccountBase";
import { Ether, ether } from "../../web3webdeploy/lib/etherUnits";

export interface DeploySmartAccountsSettings {
  chains: number[];
  openRD: OpenRDDeployment;
  addressTrustlessManagement: Address;
}

export interface SmartAccountsDeployment {
  openmeshAdmin: OpenmeshAdminDeployment;
  departments: {
    disputeDepartment: Address;
    coreMemberDepartment: Address;
    expertDepartment: Address;
  };
}

export async function deploySmartAccounts(
  deployer: Deployer,
  settings: DeploySmartAccountsSettings
): Promise<SmartAccountsDeployment> {
  deployer.startContext("lib/openmesh-admin");
  const openmeshAdminAbi = [...SmartAccountBaseContract.abi];
  const openmeshAdmin = await multiDeploy(
    (chainId) =>
      openmeshAdminDeploy(deployer, {
        adminSettings: {
          id: `OpenmeshAdmin_${chainId}`,
          chainId: chainId,
          ...getChainSettings(chainId),
        },
      }),
    settings.chains
  );
  const disputeDepartment = await multiDeploy(
    (chainId) =>
      deployAdmin(deployer, {
        id: `DisputeDepartmentSmartAccount_${chainId}`,
        chainId: chainId,
        salt: DepartmentTags.Dispute,
        ...getChainSettings(chainId),
      }),
    settings.chains
  );
  const coreMemberDepartment = await multiDeploy(
    (chainId) =>
      deployAdmin(deployer, {
        id: `CoreMemberDepartmentSmartAccount_${chainId}`,
        chainId: chainId,
        salt: DepartmentTags.CoreMember,
        ...getChainSettings(chainId),
      }),
    settings.chains
  );
  const expertDepartment = await multiDeploy(
    (chainId) =>
      deployAdmin(deployer, {
        id: `ExpertDepartmentSmartAccount_${chainId}`,
        chainId: chainId,
        salt: DepartmentTags.Expert,
        ...getChainSettings(chainId),
      }),
    settings.chains
  );
  deployer.finishContext();

  // Enable OpenR&D DAO extensions for certain smart accounts
  // Currently just enable disputes in Dispute Department
  deployer.startContext("lib/trustless-actions");
  const pessimisticActions = await multiDeploy(
    (chainId) =>
      deployPessimisticActions(deployer, {
        id: `PessimisticActions_${chainId}`,
        chainId: chainId,
      }),
    settings.chains
  );
  deployer.finishContext();

  deployer.startContext("lib/openrd-dao-extensions");
  const smartAccountTaskDisputesInstaller = await multiDeploy(
    (chainId) =>
      deployer
        .deploy({
          id: `SmartAccountTaskDisputeInstaller_${chainId}`,
          contract: "SmartAccountTaskDisputeInstaller",
          args: [
            SmartAccountTrustlessExecutionContract.address,
            settings.addressTrustlessManagement,
            pessimisticActions,
            settings.openRD.openRDDaoExtensions.taskDisputes,
            settings.openRD.openRD.tasks,
          ],
          chainId: chainId,
          ...getChainSettings(chainId),
        })
        .then((deployment) => deployment.address),
    settings.chains
  );
  const smartAccountTaskDisputesInstallerAbi = await deployer.getAbi(
    "SmartAccountTaskDisputeInstaller"
  );
  const enableDisputesCall = (cost: bigint) => {
    return deployer.viem.encodeFunctionData({
      abi: openmeshAdminAbi,
      functionName: "performDelegateCall",
      args: [
        smartAccountTaskDisputesInstaller,
        deployer.viem.encodeFunctionData({
          abi: smartAccountTaskDisputesInstallerAbi,
          functionName: "fullInstall",
          args: [cost],
        }),
      ],
    });
  };
  deployer.finishContext();
  deployer.startContext("lib/openmesh-admin");
  await multiDeploy(
    (chainId) =>
      deployer
        .execute({
          id: `EnableDisputesForDisputeDepartmentSmartAccount_${chainId}`,
          abi: openmeshAdminAbi,
          to: disputeDepartment,
          function: "multicall",
          args: [[enableDisputesCall(getDisputeCost(chainId))]],
          chainId: chainId,
          from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
          ...getChainSettings(chainId),
        })
        .then((deployment) => {}),
    settings.chains
  );
  deployer.finishContext();

  return {
    openmeshAdmin: openmeshAdmin,
    departments: {
      disputeDepartment: disputeDepartment,
      coreMemberDepartment: coreMemberDepartment,
      expertDepartment: expertDepartment,
    },
  };
}

function getDisputeCost(chainId: number): bigint {
  switch (chainId) {
    case 1:
      return ether / BigInt(50); // 0.02 ETH
    case 137:
      return Ether(10); // 10 MATIC
    case 80001:
    case 11155111:
      return BigInt(chainId); // Very low (and unique per chain for proper testing)
    default:
      throw new Error(`Unknown dispute  cost for chain ${chainId}`);
  }
}
