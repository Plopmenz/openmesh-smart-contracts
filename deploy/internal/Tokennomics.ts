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
import { getChainSettings } from "../deploy";

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
    openSettings: {
      chainId: settings.chainId,
      ...getChainSettings(settings.chainId),
    },
    // forceRedeploy: false,
  });
  deployer.finishContext();
  deployer.startContext("lib/validator-pass");
  const validatorPass = await validatorPassDeploy(deployer, {
    validatorPassSettings: {
      chainId: settings.chainId,
      ...getChainSettings(settings.chainId),
    },
    // forceRedeploy: false,
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
      maxWeiPerAccount: Ether(2), // 2 ETH,
      chainId: settings.chainId,
      ...getChainSettings(settings.chainId),
    },
    // forceRedeploy: false,
  });
  deployer.finishContext();
  deployer.startContext("lib/open-claiming");
  const openClaiming = await openClaimingDeploy(deployer, {
    openTokenDeployment: openToken,
    verifiedContributorClaiming: {
      chainId: settings.chainId,
      ...getChainSettings(settings.chainId),
    },
    nodesWithdrawClaiming: {
      chainId: settings.chainId,
      ...getChainSettings(settings.chainId),
    },
    // forceRedeploy: false,
  });
  deployer.finishContext();

  deployer.startContext("lib/open-token");
  const OPENAbi = await deployer.getAbi("OPEN");
  const OPENMinting = [
    settings.smartAccounts.openmeshAdmin.admin,
    openClaiming.ovcClaiming,
    openClaiming.nodeClaiming,
  ];
  const grantOpenMintingDatas = OPENMinting.map((contractAddress) =>
    deployer.viem.encodeFunctionData({
      abi: OPENAbi,
      functionName: "grantRole",
      args: [
        deployer.viem.keccak256(deployer.viem.toBytes("MINT")),
        contractAddress,
      ],
    })
  );
  const mintGenesisOpenTokensData = deployer.viem.encodeFunctionData({
    abi: OPENAbi,
    functionName: "mint",
    args: [openmeshGenesis.openmeshGenesis, Ether(80_000_000)],
  });
  deployer.finishContext();
  deployer.startContext("lib/validator-pass");
  const grantGenesisGenesisValidatorPassMintingData =
    deployer.viem.encodeFunctionData({
      abi: await deployer.getAbi("ValidatorPass"),
      functionName: "grantRole",
      args: [
        deployer.viem.keccak256(deployer.viem.toBytes("MINT")),
        openmeshGenesis.openmeshGenesis,
      ],
    });
  deployer.finishContext();
  deployer.startContext("lib/openmesh-admin");
  const openmeshAdminAbi = await deployer.getAbi("OpenmeshAdmin");
  const grantOpenMintingCalls = grantOpenMintingDatas.map(
    (grantOpenMintingData) =>
      deployer.viem.encodeFunctionData({
        abi: openmeshAdminAbi,
        functionName: "performCall",
        args: [openToken.openToken, BigInt(0), grantOpenMintingData],
      })
  );
  const mintGenesisOpenTokensCall = deployer.viem.encodeFunctionData({
    abi: openmeshAdminAbi,
    functionName: "performCall",
    args: [openToken.openToken, BigInt(0), mintGenesisOpenTokensData],
  });
  const grantGenesisGenesisValidatorPassMintingCall =
    deployer.viem.encodeFunctionData({
      abi: openmeshAdminAbi,
      functionName: "performCall",
      args: [
        validatorPass.validatorPass,
        BigInt(0),
        grantGenesisGenesisValidatorPassMintingData,
      ],
    });
  await deployer.execute({
    id: "GrantTokennomicsAccessControlRoles",
    abi: "OpenmeshAdmin",
    to: settings.smartAccounts.openmeshAdmin.admin,
    function: "multicall",
    args: [
      [
        ...grantOpenMintingCalls,
        mintGenesisOpenTokensCall,
        grantGenesisGenesisValidatorPassMintingCall,
      ],
    ],
    chainId: settings.chainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
    ...getChainSettings(settings.chainId),
  });
  await deployer.finishContext();

  return {
    openToken: openToken,
    validatorPass: validatorPass,
    openmeshGenesis: openmeshGenesis,
    openClaiming: openClaiming,
  };
}
