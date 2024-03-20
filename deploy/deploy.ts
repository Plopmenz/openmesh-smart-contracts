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

export async function deploy(
  deployer: Deployer,
  settings?: OpenmeshDeploymentSettings
): Promise<OpenmeshDeployment> {
  if (settings?.forceRedeploy !== undefined && !settings.forceRedeploy) {
    return await deployer.loadDeployment({ deploymentName: "latest.json" });
  }

  // Testnet
  const ethereumChainId = 11155111;
  const polygonChainId = 80001;
  const aragonNetwork = SupportedNetworks.MUMBAI;

  // OpenR&D
  const openRD = await deployOpenRD(deployer, {
    chains: [ethereumChainId, polygonChainId],
  });

  // Smart accounts (single deterministic address to allow flexible control)
  const smartAccounts = await deploySmartAccounts(deployer, {
    chains: [ethereumChainId, polygonChainId],
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
  });

  // Ethereum accounts for the polygon departments
  const crossChainDepartments = await deployCrossChainDepartments(deployer, {
    acountChainId: ethereumChainId,
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