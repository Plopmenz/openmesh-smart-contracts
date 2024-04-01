import { Deployer } from "../../web3webdeploy/types";
import { getChainSettings, multiDeploy, testSalt } from "../deploy";

import {
  TasksDeployment,
  deploy as openRDDeploy,
} from "../../lib/openrd-foundry/deploy/deploy";
import {
  OpenRDDaoExtensionsDeployment,
  deploy as openRDDaoExtensionsDeploy,
} from "../../lib/openrd-dao-extensions/deploy/deploy";
import {
  RFPsDeployment,
  deploy as openRFPDeploy,
} from "../../lib/openrfp/deploy/deploy";

export interface DeployOpenRDSettings {
  chains: number[];
}

export interface OpenRDDeployment {
  openRD: TasksDeployment;
  openRDDaoExtensions: OpenRDDaoExtensionsDeployment;
  openRFP: RFPsDeployment;
}

export async function deployOpenRD(
  deployer: Deployer,
  settings: DeployOpenRDSettings
): Promise<OpenRDDeployment> {
  deployer.startContext("lib/openrd-foundry");
  const openRD = await multiDeploy(
    (chainId) =>
      openRDDeploy(deployer, {
        tasksSettings: {
          id: `OpenRD_${chainId}`,
          chainId: chainId,
          salt: testSalt ?? undefined,
          ...getChainSettings(chainId),
        },
      }),
    settings.chains
  );
  deployer.finishContext();
  deployer.startContext("lib/openrd-dao-extensions");
  const openRDDaoExtensions = await multiDeploy(
    (chainId) =>
      openRDDaoExtensionsDeploy(deployer, {
        tasksDeployment: openRD,
        taskDisputeDeploymentSettings: {
          id: `OpenRDDisputes_${chainId}`,
          chainId: chainId,
          salt: testSalt ?? undefined,
          ...getChainSettings(chainId),
        },
        taskDraftsDeploymentSettings: {
          id: `OpenRDDrafts_${chainId}`,
          chainId: chainId,
          salt: testSalt ?? undefined,
          ...getChainSettings(chainId),
        },
      }),
    settings.chains
  );
  deployer.finishContext();
  deployer.startContext("lib/openrfp");
  const openRFP = await multiDeploy(
    (chainId) =>
      openRFPDeploy(deployer, {
        tasksDeployment: openRD,
        rfpsDeploymentSettings: {
          id: `OpenRFP_${chainId}`,
          chainId: chainId,
          salt: testSalt ?? undefined,
          ...getChainSettings(chainId),
        },
      }),
    settings.chains
  );
  deployer.finishContext();

  return {
    openRD: openRD,
    openRDDaoExtensions: openRDDaoExtensions,
    openRFP: openRFP,
  };
}
