import { Deployer, Address } from "../../web3webdeploy/types";
import { SmartAccountsDeployment } from "./SmartAccounts";

import {
  VerifiedContributorDeployment,
  deploy as verifiedContributorDeploy,
} from "../../lib/verified-contributor/deploy/deploy";
import { deploy as optimisticActionsDeploy } from "../../lib/optimistic-actions/deploy/deploy";
import { deploy as aragonTagVotingDeploy } from "../../lib/aragon-tag-voting/deploy/deploy";
import { deployDepartmentFactory } from "../../lib/openmesh-department/deploy/internal/DepartmentFactory";
import { deployDepartment } from "../../lib/openmesh-department/deploy/internal/Department";
import {
  SupportedNetworks,
  SupportedVersions,
  getNetworkDeploymentForVersion,
} from "../../lib/osx-commons/configs/src";
import { OpenRDDeployment } from "./OpenRD";

export interface DeployDepartmentsSettings {
  smartAccounts: SmartAccountsDeployment;
  openRD: OpenRDDeployment;
  chainId: number;
  aragonNetwork: SupportedNetworks;
}

export interface DepartmentsDeployment {
  verifiedContributor: VerifiedContributorDeployment;
  verifiedContributorTagManager: Address;
  verifiedContributorCountTrustlessManagement: Address;
  verifiedContributorTagTrustlessManagement: Address;
  departmentDaos: {
    departmentFactory: Address;
    departmentOwner: Address;
    disputeDepartment: Address;
    coreMemberDepartment: Address;
  };
}

export async function deployDepartments(
  deployer: Deployer,
  settings: DeployDepartmentsSettings
): Promise<DepartmentsDeployment> {
  const aragonDeployment = getNetworkDeploymentForVersion(
    settings.aragonNetwork,
    SupportedVersions.V1_3_0
  );
  if (!aragonDeployment) {
    throw new Error("Aragon deployment not found");
  }

  deployer.startContext("lib/verified-contributor");
  const verifiedContributor = await verifiedContributorDeploy(deployer, {
    verifiedContributorSettings: { chainId: settings.chainId },
    // forceRedeploy: false,
  });
  deployer.finishContext();
  deployer.startContext("lib/tag-manager");
  const verifiedContributorTagManager = await deployer
    .deploy({
      id: "VerifiedContributorTagManager",
      contract: "ERC721TagManager",
      args: [
        verifiedContributor.verifiedContributor,
        settings.smartAccounts.openmeshAdmin.admin,
      ],
      chainId: settings.chainId,
    })
    .then((deployment) => deployment.address);
  deployer.finishContext();
  deployer.startContext("lib/trustless-management");
  const addressTrustlessManagement = await deployer
    .deploy({
      id: "AddressTrustlessManagement",
      contract: "AddressTrustlessManagement",
      chainId: settings.chainId,
    })
    .then((deployment) => deployment.address);
  const verifiedContributorCountTrustlessManagement = await deployer
    .deploy({
      id: "VerifiedContributorCountTrustlessManagement",
      contract: "ERC721CountTrustlessManagement",
      args: [verifiedContributorTagManager],
      chainId: settings.chainId,
    })
    .then((deployment) => deployment.address);
  const verifiedContributorTagTrustlessManagement = await deployer
    .deploy({
      id: "VerifiedContributorTagTrustlessManagement",
      contract: "TagTrustlessManagement",
      args: [verifiedContributorTagManager],
      chainId: settings.chainId,
    })
    .then((deployment) => deployment.address);
  deployer.finishContext();
  deployer.startContext("lib/optimistic-actions");
  const optimisticActions = await optimisticActionsDeploy(deployer, {
    optimisticActionsSettings: {
      chainId: settings.chainId,
    },
    // forceRedeploy: false,
  });
  deployer.finishContext();
  deployer.startContext("lib/aragon-tag-voting");
  const aragonTagVoting = await aragonTagVotingDeploy(deployer, {
    aragonDeployment: aragonDeployment,
    tagVotingSetupSettings: {
      chainId: settings.chainId,
    },
    tagVotingRepoSettings: {
      subdomain: "tag-voting",
      maintainer: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
      chainId: settings.chainId,
    },
    // forceRedeploy: false,
  });
  deployer.finishContext();
  deployer.startContext("lib/openmesh-department");
  const departmentFactoryDeployment = await deployDepartmentFactory(deployer, {
    pluginSetupProcessor: aragonDeployment.PluginSetupProcessor
      .address as Address,
    tagManager: verifiedContributorTagManager,
    tagVotingRepo: aragonTagVoting.tagVotingRepo,
    trustlessManagement: verifiedContributorTagTrustlessManagement,
    addressTrustlessManagement: addressTrustlessManagement,
    optimisticActions: optimisticActions.optimisticActions,
    openRD: settings.openRD.openRD.tasks,
    departmentOwnerSettings: {
      metadata: "0x",
      tokenVoting: aragonDeployment.TokenVotingRepoProxy.address as Address,
      token: verifiedContributor.verifiedContributor,
      trustlessManagement: verifiedContributorCountTrustlessManagement,
    },
    chainId: settings.chainId,
  });
  deployer.finishContext();
  deployer.startContext("lib/tag-manager");
  const grantDepartmentFactoryVerifiedContributorTagAdminData =
    deployer.viem.encodeFunctionData({
      abi: await deployer.getAbi("ERC721TagManager"),
      functionName: "grantRole",
      args: [
        deployer.viem.zeroHash, // Default Admin Role
        departmentFactoryDeployment.departmentFactory,
      ],
    });
  deployer.finishContext();
  deployer.startContext("lib/openmesh-admin");
  await deployer.execute({
    id: "GrantDepartmentFactoryVerifiedContributorTagAdmin",
    abi: "OpenmeshAdmin",
    to: settings.smartAccounts.openmeshAdmin.admin,
    function: "performCall",
    args: [
      verifiedContributorTagManager,
      BigInt(0),
      grantDepartmentFactoryVerifiedContributorTagAdminData,
    ],
    chainId: settings.chainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
  });
  await deployer.finishContext();
  deployer.startContext("lib/openmesh-department");
  const disputeDepartment = await deployDepartment(deployer, {
    id: "DisputeDepartment",
    name: "DISPUTE",
    departmentFactory: departmentFactoryDeployment.departmentFactory,
    chainId: settings.chainId,
  });
  const coreMemberDepartment = await deployDepartment(deployer, {
    id: "CoreMemberDepartment",
    name: "CORE_MEMBER",
    departmentFactory: departmentFactoryDeployment.departmentFactory,
    chainId: settings.chainId,
  });
  deployer.finishContext();

  return {
    verifiedContributor: verifiedContributor,
    verifiedContributorTagManager: verifiedContributorTagManager,
    verifiedContributorCountTrustlessManagement:
      verifiedContributorCountTrustlessManagement,
    verifiedContributorTagTrustlessManagement:
      verifiedContributorTagTrustlessManagement,
    departmentDaos: {
      ...departmentFactoryDeployment,
      disputeDepartment: disputeDepartment,
      coreMemberDepartment: coreMemberDepartment,
    },
  };
}
