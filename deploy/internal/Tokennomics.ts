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

  deployer.startContext("lib/open-token");
  const grantOpenmeshAdminOpenMintingData = deployer.viem.encodeFunctionData({
    abi: await deployer.getAbi("OPEN"),
    functionName: "grantRole",
    args: [
      deployer.viem.keccak256(deployer.viem.toBytes("MINT")),
      settings.smartAccounts.openmeshAdmin.admin,
    ],
  });
  const mintGenesisOpenTokensData = deployer.viem.encodeFunctionData({
    abi: await deployer.getAbi("OPEN"),
    functionName: "mint",
    args: [openmeshGenesis.openmeshGenesis, Ether(80_000_000)],
  });
  const grantOVCOpenClaimingOpenMintingData = deployer.viem.encodeFunctionData({
    abi: await deployer.getAbi("OPEN"),
    functionName: "grantRole",
    args: [
      deployer.viem.keccak256(deployer.viem.toBytes("MINT")),
      openClaiming.ovcClaiming,
    ],
  });
  const grantNodeOpenClaimingOpenMintingData = deployer.viem.encodeFunctionData(
    {
      abi: await deployer.getAbi("OPEN"),
      functionName: "grantRole",
      args: [
        deployer.viem.keccak256(deployer.viem.toBytes("MINT")),
        openClaiming.nodeClaiming,
      ],
    }
  );
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
  const grantOpenmeshAdminOpenMintingCall = deployer.viem.encodeFunctionData({
    abi: await deployer.getAbi("OpenmeshAdmin"),
    functionName: "performCall",
    args: [openToken.openToken, BigInt(0), grantOpenmeshAdminOpenMintingData],
  });
  const mintGenesisOpenTokensCall = deployer.viem.encodeFunctionData({
    abi: await deployer.getAbi("OpenmeshAdmin"),
    functionName: "performCall",
    args: [openToken.openToken, BigInt(0), mintGenesisOpenTokensData],
  });
  const grantOVCOpenClaimingOpenMintingCall = deployer.viem.encodeFunctionData({
    abi: await deployer.getAbi("OpenmeshAdmin"),
    functionName: "performCall",
    args: [openToken.openToken, BigInt(0), grantOVCOpenClaimingOpenMintingData],
  });
  const grantNodeOpenClaimingOpenMintingCall = deployer.viem.encodeFunctionData(
    {
      abi: await deployer.getAbi("OpenmeshAdmin"),
      functionName: "performCall",
      args: [
        openToken.openToken,
        BigInt(0),
        grantNodeOpenClaimingOpenMintingData,
      ],
    }
  );
  const grantGenesisGenesisValidatorPassMintingCall =
    deployer.viem.encodeFunctionData({
      abi: await deployer.getAbi("OpenmeshAdmin"),
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
        grantOpenmeshAdminOpenMintingCall,
        mintGenesisOpenTokensCall,
        grantOVCOpenClaimingOpenMintingCall,
        grantNodeOpenClaimingOpenMintingCall,
        grantGenesisGenesisValidatorPassMintingCall,
      ],
    ],
    chainId: settings.chainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
  });
  await deployer.finishContext();

  return {
    openToken: openToken,
    validatorPass: validatorPass,
    openmeshGenesis: openmeshGenesis,
    openClaiming: openClaiming,
  };
}
