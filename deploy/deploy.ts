import { Deployer } from "../web3webdeploy/types";

import { OpenRDDeployment, deployOpenRD } from "./internal/OpenRD";
import {
  SmartAccountsDeployment,
  deploySmartAccounts,
} from "./internal/SmartAccounts";
import {
  OpenmeshTokennomicsDeployment,
  deployOpenmeshTokennomics,
} from "./internal/Tokennomics";
import {
  DepartmentsDeployment,
  deployDepartments,
} from "./internal/Departments";
import {
  CrossChainDepartmentsDeployment,
  deployCrossChainDepartments,
} from "./internal/CrossChainDepartments";

import { SupportedNetworks } from "../lib/osx-commons/configs/src";
import { Gwei, gwei } from "../web3webdeploy/lib/etherUnits";

export interface OpenmeshDeploymentSettings {
  forceRedeploy?: boolean;
}

export interface OpenmeshDeployment {
  openRD: OpenRDDeployment;
  smartAccounts: SmartAccountsDeployment;
  tokennomics: OpenmeshTokennomicsDeployment;
  departments: DepartmentsDeployment;
  crossChainDepartments: CrossChainDepartmentsDeployment;
}

// As our deployment process is relying on deterministic addresses, you can change this variable to do multiple deployments for 1 chain.
// In addition to this, you need to replace all occurrences of 0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51 with the address that you can control (it is required to sign a few transactions).
// You'll also need to replace all occurrences of 0xaD2dc241DcBbC2F5c413d96C1A779cd6C40791A3 with the new OpenmeshAdminSmartAccount address
//  (to get this you can attempt to deploy, which will give an error at GrantTokennomicsAccessControlRoles but will generate the predicted deployment address for the Openmesh Admin Smart Account).
// Replacing all means also in every submodule! (as these variables are set in the smart contracts too) This can be done using CTRL + SHIFT + F in Visual Studio Code.
// This salt should only contain non-capital letters and -'s (as it's used in ENS subdomains).
export const testSalt: string | undefined = undefined;

export async function deploy(
  deployer: Deployer,
  settings?: OpenmeshDeploymentSettings
): Promise<OpenmeshDeployment> {
  if (settings?.forceRedeploy !== undefined && !settings.forceRedeploy) {
    const existingDeployment = await deployer.loadDeployment({
      deploymentName: "latest.json",
    });
    if (existingDeployment !== undefined) {
      return existingDeployment;
    }
  }

  // Testnet
  const ethereumChainId = 11155111;
  const polygonChainId = 421614;
  const aragonNetwork = SupportedNetworks.ARBITRUM_SEPOLIA;

  // Trustless management
  deployer.startContext("lib/trustless-management");
  const addressTrustlessManagement = await multiDeploy(
    (chainId) =>
      deployer
        .deploy({
          id: `AddressTrustlessManagement_${chainId}`,
          contract: "AddressTrustlessManagement",
          chainId: chainId,
          salt: testSalt ?? undefined,
          ...getChainSettings(chainId),
        })
        .then((deployment) => deployment.address),
    [ethereumChainId, polygonChainId]
  );
  deployer.finishContext();

  // OpenR&D
  const openRD = await deployOpenRD(deployer, {
    chains: [ethereumChainId, polygonChainId],
  });

  // Smart accounts (single deterministic address to allow flexible control)
  const smartAccounts = await deploySmartAccounts(deployer, {
    chains: [ethereumChainId, polygonChainId],
    openRD: openRD,
    addressTrustlessManagement: addressTrustlessManagement,
  });

  // Openmesh token collections
  const tokennomics = await deployOpenmeshTokennomics(deployer, {
    chainId: ethereumChainId,
    smartAccounts: smartAccounts,
  });

  // Verified Contributor and Department DAOs
  const departments = await deployDepartments(deployer, {
    smartAccounts: smartAccounts,
    openRD: openRD,
    chainId: polygonChainId,
    aragonNetwork: aragonNetwork,
    addressTrustlessManagement: addressTrustlessManagement,
  });

  // Ethereum accounts for the polygon departments
  const crossChainDepartments = await deployCrossChainDepartments(deployer, {
    accountChainId: ethereumChainId,
    departmentChainId: polygonChainId,
    smartAccounts: smartAccounts,
  });

  const deployment: OpenmeshDeployment = {
    openRD: openRD,
    smartAccounts: smartAccounts,
    tokennomics: tokennomics,
    departments: departments,
    crossChainDepartments: crossChainDepartments,
  };
  await deployer.saveDeployment({
    deploymentName: "latest.json",
    deployment: deployment,
  });
  return deployment;
}

export function getChainSettings(chainId: number): {
  baseFee?: bigint;
  priorityFee?: bigint;
} {
  switch (chainId) {
    case 1:
      return {
        baseFee: Gwei(20),
        priorityFee: gwei / BigInt(2),
      };
    case 137:
      return {
        baseFee: Gwei(75),
        priorityFee: Gwei(30),
      };
    case 421614:
      return {
        baseFee: gwei,
        priorityFee: gwei / BigInt(10),
      };
    case 11155111:
      return {
        baseFee: gwei + gwei / BigInt(2),
        priorityFee: gwei + gwei / BigInt(2),
      };
    default:
      return {};
  }
}

export async function multiDeploy<T>(
  deployFn: (chainId: number) => Promise<T>,
  chains: number[]
): Promise<T> {
  if (chains.length === 0) {
    throw new Error("Multideploy called with no chains");
  }

  const deployments = await Promise.all(chains.map(deployFn));
  const deterministicDeployment = deployments[0]; // Address of deployments should be the same across all chains (CREATE2)
  if (
    deployments.some(
      (deployment) =>
        deployment !== deterministicDeployment &&
        JSON.stringify(deployment) !== JSON.stringify(deterministicDeployment)
    )
  ) {
    throw new Error(
      `Multideploy got different deployments on different chains: ${JSON.stringify(
        deployments
      )}`
    );
  }
  return deterministicDeployment;
}
