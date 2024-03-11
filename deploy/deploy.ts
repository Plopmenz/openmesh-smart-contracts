import { Deployer } from "../web3webdeploy/types";
import {
  OpenmeshAdminDeployment,
  deploy as openmeshAdminDeploy,
} from "../lib/openmesh-admin/deploy/deploy";
import {
  OpenTokenDeployment,
  deploy as openTokenDeploy,
} from "../lib/open-token/deploy/deploy";
import {
  ValidatorPassDeployment,
  deploy as validatorPassDeploy,
} from "../lib/validator-pass/deploy/deploy";
import {
  OpenmeshGenesisDeployment,
  deploy as openmeshGenesisDeploy,
} from "../lib/openmesh-genesis/deploy/deploy";
import {
  VerifiedContributorDeployment,
  deploy as verifiedContributorDeploy,
} from "../lib/verified-contributor/deploy/deploy";
import {
  TasksDeployment,
  deploy as openRDDeploy,
} from "../lib/openrd-foundry/deploy/deploy";
import {
  OpenRDDaoExtensionsDeployment,
  deploy as openRDDaoExtensionsDeploy,
} from "../lib/openrd-dao-extensions/deploy/deploy";
import {
  RFPsDeployment,
  deploy as openRFPDeploy,
} from "../lib/openrfp/deploy/deploy";
import {
  OpenClaimingDeployment,
  deploy as openClaimingDeploy,
} from "../lib/open-claiming/deploy/deploy";
import { UTCBlockchainDate } from "../lib/openmesh-genesis/utils/timeUnits";
import { Ether, Gwei, ether } from "../web3webdeploy/lib/etherUnits";

export interface OpenmeshDeploymentSettings {
  forceRedeploy?: boolean;
}

export interface OpenmeshDeployment {
  openmeshAdmin: OpenmeshAdminDeployment;
  openToken: OpenTokenDeployment;
  validatorPass: ValidatorPassDeployment;
  openmeshGenesis: OpenmeshGenesisDeployment;
  verifiedContributor: VerifiedContributorDeployment;
  openRD: TasksDeployment;
  openRDDaoExtensions: OpenRDDaoExtensionsDeployment;
  openRFP: RFPsDeployment;
  openClaiming: OpenClaimingDeployment;
}

export async function deploy(
  deployer: Deployer,
  settings?: OpenmeshDeploymentSettings
): Promise<OpenmeshDeployment> {
  if (settings?.forceRedeploy !== undefined && !settings.forceRedeploy) {
    return await deployer.loadDeployment({ deploymentName: "latest.json" });
  }

  deployer.startContext("lib/openmesh-admin");
  const openmeshAdmin = await openmeshAdminDeploy(deployer, {
    adminSettings: {},
  });
  deployer.finishContext();
  deployer.startContext("lib/open-token");
  const openToken = await openTokenDeploy(deployer, {
    openSettings: {},
  });
  deployer.finishContext();
  deployer.startContext("lib/validator-pass");
  const validatorPass = await validatorPassDeploy(deployer, {
    validatorPassSettings: {},
  });
  deployer.finishContext();
  deployer.startContext("lib/openmesh-genesis");
  const openmeshGenesis = await openmeshGenesisDeploy(deployer, {
    openTokenDeployment: openToken,
    validatorPassDeployment: validatorPass,
    openmeshGenesisSettings: {
      tokensPerWeiPerPeriod: [BigInt(30_000), BigInt(27_500), BigInt(25_000)],
      start: UTCBlockchainDate(2024, 3, 2), // 2 March 2024
      periodEnds: [
        UTCBlockchainDate(2024, 3, 10), // 10 March 2024
        UTCBlockchainDate(2024, 3, 20), // 20 March 2024
        UTCBlockchainDate(2024, 3, 30), // 30 March 2024
      ],
      minWeiPerAccount: ether / BigInt(2), // 0.5 ETH
      maxWeiPerAccount: Ether(2), // 2 ETH
    },
  });
  deployer.finishContext();
  deployer.startContext("lib/verified-contributor");
  const verifiedContributor = await verifiedContributorDeploy(deployer, {
    openTokenDeployment: openToken,
    verifiedContributorSettings: {},
    verifiedContributorStakingSettings: { tokensPerSecond: Gwei(3858024) }, // ~10_000 OPEN every 30 days (9999.998208)
  });
  deployer.finishContext();
  deployer.startContext("lib/openrd-foundry");
  const openRD = await openRDDeploy(deployer, { tasksSettings: {} });
  deployer.finishContext();
  deployer.startContext("lib/openrd-dao-extensions");
  const openRDDaoExtensions = await openRDDaoExtensionsDeploy(deployer, {
    tasksDeployment: openRD,
    taskDisputeDeploymentSettings: {},
    taskDraftsDeploymentSettings: {},
  });
  deployer.finishContext();
  deployer.startContext("lib/openrfp");
  const openRFP = await openRFPDeploy(deployer, {
    tasksDeployment: openRD,
    rfpsDeploymentSettings: {},
  });
  deployer.finishContext();
  deployer.startContext("lib/open-claiming");
  const openClaiming = await openClaimingDeploy(deployer, {
    openTokenDeployment: openToken,
  });
  deployer.finishContext();

  const deployment: OpenmeshDeployment = {
    openmeshAdmin: openmeshAdmin,
    openToken: openToken,
    validatorPass: validatorPass,
    openmeshGenesis: openmeshGenesis,
    verifiedContributor: verifiedContributor,
    openRD: openRD,
    openRDDaoExtensions: openRDDaoExtensions,
    openRFP: openRFP,
    openClaiming: openClaiming,
  };
  await deployer.saveDeployment({
    deploymentName: "latest.json",
    deployment: deployment,
  });
  return deployment;
}
