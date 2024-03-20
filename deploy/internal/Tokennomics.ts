import { Deployer } from "../../web3webdeploy/types";
import { SmartAccountsDeployment } from "./SmartAccounts";
import { UTCBlockchainDate } from "../../lib/openmesh-genesis/utils/timeUnits";
import { Ether, ether } from "../../web3webdeploy/lib/etherUnits";

import {
  OpenTokenDeployment,
  deploy as openTokenDeploy,
} from "../../lib/open-token/deploy/deploy";
import {
  ValidatorPassDeployment,
  deploy as validatorPassDeploy,
} from "../../lib/validator-pass/deploy/deploy";
import {
  OpenmeshGenesisDeployment,
  deploy as openmeshGenesisDeploy,
} from "../../lib/openmesh-genesis/deploy/deploy";
import {
  OpenClaimingDeployment,
  deploy as openClaimingDeploy,
} from "../../lib/open-claiming/deploy/deploy";

export interface DeployOpenmeshTokennomicsSettings {
  smartAccounts: SmartAccountsDeployment;
  chainId: number;
}

export interface OpenmeshTokennomicsDeployment {
  openToken: OpenTokenDeployment;
  validatorPass: ValidatorPassDeployment;
  openmeshGenesis: OpenmeshGenesisDeployment;
  openClaiming: OpenClaimingDeployment;
}

export async function deployOpenmeshTokennomics(
  deployer: Deployer,
  settings: DeployOpenmeshTokennomicsSettings
): Promise<OpenmeshTokennomicsDeployment> {
  deployer.startContext("lib/open-token");
  const openToken = await openTokenDeploy(deployer, {
    openSettings: { chainId: settings.chainId },
    // forceRedeploy: false,
  });
  deployer.finishContext();
  deployer.startContext("lib/validator-pass");
  const validatorPass = await validatorPassDeploy(deployer, {
    validatorPassSettings: { chainId: settings.chainId },
    // forceRedeploy: false,
  });
  deployer.finishContext();
  deployer.startContext("lib/openmesh-genesis");
  const openmeshGenesis = await openmeshGenesisDeploy(deployer, {
    openTokenDeployment: openToken,
    validatorPassDeployment: validatorPass,
    openmeshGenesisSettings: {
      chainId: settings.chainId,

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
    // forceRedeploy: false,
  });
  deployer.finishContext();
  deployer.startContext("lib/open-claiming");
  const openClaiming = await openClaimingDeploy(deployer, {
    openTokenDeployment: openToken,
    verifiedContributorClaiming: { chainId: settings.chainId },
    nodesWithdrawClaiming: { chainId: settings.chainId },
    // forceRedeploy: false,
  });
  deployer.finishContext();

  return {
    openToken: openToken,
    validatorPass: validatorPass,
    openmeshGenesis: openmeshGenesis,
    openClaiming: openClaiming,
  };
}
