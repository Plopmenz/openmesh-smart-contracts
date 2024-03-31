import { Deployer, Address } from "../../web3webdeploy/types";
import { SmartAccountsDeployment } from "./SmartAccounts";

import {
  VerifiedContributorDeployment,
  deploy as verifiedContributorDeploy,
} from "../../lib/verified-contributor/deploy/deploy";
import { deploy as trustlessActionsDeploy } from "../../lib/trustless-actions/deploy/deploy";
import { deploy as aragonTagVotingDeploy } from "../../lib/aragon-tag-voting/deploy/deploy";
import {
  deployDepartmentFactory,
  DeployDepartmentFactoryReturn,
} from "../../lib/openmesh-department/deploy/internal/DepartmentFactory";
import {
  deployDepartment,
  DeployDepartmentReturn,
} from "../../lib/openmesh-department/deploy/internal/Department";
import {
  SupportedNetworks,
  SupportedVersions,
  getNetworkDeploymentForVersion,
} from "../../lib/osx-commons/configs/src";
import { OpenRDDeployment } from "./OpenRD";
import { getChainSettings } from "../deploy";

export enum DepartmentTags {
  Dispute = "DISPUTE",
  CoreMember = "COREMEMBER",
  Expert = "EXPERT",
}

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
    departmentFactory: DeployDepartmentFactoryReturn;
    disputeDepartment: DeployDepartmentReturn;
    coreMemberDepartment: DeployDepartmentReturn;
    expertDepartment: DeployDepartmentReturn;
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
      ...getChainSettings(settings.chainId),
    })
    .then((deployment) => deployment.address);
  deployer.finishContext();
  deployer.startContext("lib/trustless-management");
  const addressTrustlessManagement = await deployer
    .deploy({
      id: "AddressTrustlessManagement",
      contract: "AddressTrustlessManagement",
      chainId: settings.chainId,
      ...getChainSettings(settings.chainId),
    })
    .then((deployment) => deployment.address);
  const verifiedContributorCountTrustlessManagement = await deployer
    .deploy({
      id: "VerifiedContributorCountTrustlessManagement",
      contract: "ERC721CountTrustlessManagement",
      args: [verifiedContributorTagManager],
      chainId: settings.chainId,
      ...getChainSettings(settings.chainId),
    })
    .then((deployment) => deployment.address);
  const verifiedContributorTagTrustlessManagement = await deployer
    .deploy({
      id: "VerifiedContributorTagTrustlessManagement",
      contract: "TagTrustlessManagement",
      args: [verifiedContributorTagManager],
      chainId: settings.chainId,
      ...getChainSettings(settings.chainId),
    })
    .then((deployment) => deployment.address);
  deployer.finishContext();
  deployer.startContext("lib/trustless-actions");
  const trustlessActions = await trustlessActionsDeploy(deployer, {
    optimisticActionsSettings: {
      chainId: settings.chainId,
    },
    pessimisticActionsSettings: {
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
      subdomain: "tagvoting",
      maintainer: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
      chainId: settings.chainId,
      ...getChainSettings(settings.chainId),
    },
    // forceRedeploy: false,
  });
  deployer.finishContext();
  deployer.startContext("lib/openmesh-department");
  const departmentFactory = await deployDepartmentFactory(deployer, {
    pluginSetupProcessor: aragonDeployment.PluginSetupProcessor
      .address as Address,
    tagManager: verifiedContributorTagManager,
    tagVotingRepo: aragonTagVoting.tagVotingRepo,
    trustlessManagement: verifiedContributorTagTrustlessManagement,
    addressTrustlessManagement: addressTrustlessManagement,
    optimisticActions: trustlessActions.optimisticActions,
    openRD: settings.openRD.openRD.tasks,
    departmentOwnerSettings: {
      metadata: "0x",
      tokenVoting: aragonDeployment.TokenVotingRepoProxy.address as Address,
      token: verifiedContributor.verifiedContributor,
      trustlessManagement: verifiedContributorCountTrustlessManagement,
    },
    chainId: settings.chainId,
    ...getChainSettings(settings.chainId),
  });
  deployer.finishContext();

  deployer.startContext("lib/verified-contributor");
  const verifiedContributorAbi = await deployer.getAbi("VerifiedContributor");
  const departmentOwnerRoles = [
    deployer.viem.zeroHash, // Default Admin Role
    deployer.viem.keccak256(deployer.viem.toBytes("MINT")),
    deployer.viem.keccak256(deployer.viem.toBytes("BURN")),
  ];
  const grantDepartmentOwnerVerifiedContributorRoleDatas =
    departmentOwnerRoles.map((role) =>
      deployer.viem.encodeFunctionData({
        abi: verifiedContributorAbi,
        functionName: "grantRole",
        args: [role, departmentFactory.departmentFactory],
      })
    );
  const grantOpenmeshAdminVerifiedContributorMintingData =
    deployer.viem.encodeFunctionData({
      abi: verifiedContributorAbi,
      functionName: "grantRole",
      args: [
        deployer.viem.keccak256(deployer.viem.toBytes("MINT")),
        settings.smartAccounts.openmeshAdmin.admin,
      ],
    });
  const initialVerifiedContributors = [
    {
      address: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
      tags: [
        DepartmentTags.Dispute,
        DepartmentTags.CoreMember,
        DepartmentTags.Expert,
      ],
    },
  ];
  const mintFirstVerifiedContributorDatas = initialVerifiedContributors.map(
    (initialVerifiedContributor, i) =>
      deployer.viem.encodeFunctionData({
        abi: verifiedContributorAbi,
        functionName: "mint",
        args: [initialVerifiedContributor.address, BigInt(i)],
      })
  );
  deployer.finishContext();
  deployer.startContext("lib/tag-manager");
  const tagManagerAbi = await deployer.getAbi("ERC721TagManager");
  const tagsToGrant = [
    DepartmentTags.Dispute,
    DepartmentTags.CoreMember,
    DepartmentTags.Expert,
  ];
  const grantDepartmentFactoryVerifiedContributorTagAdminData =
    deployer.viem.encodeFunctionData({
      abi: tagManagerAbi,
      functionName: "grantRole",
      args: [
        deployer.viem.zeroHash, // Default Admin Role
        departmentFactory.departmentFactory,
      ],
    });
  const grantOpenmeshAdminVerifiedContributorDepartmentTagDatas =
    tagsToGrant.map((tag) =>
      deployer.viem.encodeFunctionData({
        abi: tagManagerAbi,
        functionName: "grantRole",
        args: [
          deployer.viem.keccak256(deployer.viem.toBytes(tag)),
          settings.smartAccounts.openmeshAdmin.admin,
        ],
      })
    );
  const tagFirstVerifiedContributorDatas = initialVerifiedContributors
    .map((initialVerifiedContributor, i) =>
      initialVerifiedContributor.tags.map((tag) =>
        deployer.viem.encodeFunctionData({
          abi: tagManagerAbi,
          functionName: "addTag",
          args: [
            BigInt(i),
            deployer.viem.keccak256(deployer.viem.toBytes(tag)),
          ],
        })
      )
    )
    .flat();
  deployer.finishContext();
  deployer.startContext("lib/openmesh-admin");
  const openmeshAdminAbi = await deployer.getAbi("OpenmeshAdmin");
  const grantDepartmentOwnerVerifiedContributorAdminCalls =
    grantDepartmentOwnerVerifiedContributorRoleDatas.map(
      (grantDepartmentOwnerVerifiedContributorRoleData) =>
        deployer.viem.encodeFunctionData({
          abi: openmeshAdminAbi,
          functionName: "performCall",
          args: [
            verifiedContributor.verifiedContributor,
            BigInt(0),
            grantDepartmentOwnerVerifiedContributorRoleData,
          ],
        })
    );
  const grantOpenmeshAdminVerifiedContributorMintingCall =
    deployer.viem.encodeFunctionData({
      abi: openmeshAdminAbi,
      functionName: "performCall",
      args: [
        verifiedContributor.verifiedContributor,
        BigInt(0),
        grantOpenmeshAdminVerifiedContributorMintingData,
      ],
    });
  const mintFirstVerifiedContributorCalls =
    mintFirstVerifiedContributorDatas.map((mintFirstVerifiedContributorData) =>
      deployer.viem.encodeFunctionData({
        abi: openmeshAdminAbi,
        functionName: "performCall",
        args: [
          verifiedContributor.verifiedContributor,
          BigInt(0),
          mintFirstVerifiedContributorData,
        ],
      })
    );
  const grantDepartmentFactoryVerifiedContributorTagAdminCall =
    deployer.viem.encodeFunctionData({
      abi: openmeshAdminAbi,
      functionName: "performCall",
      args: [
        verifiedContributorTagManager,
        BigInt(0),
        grantDepartmentFactoryVerifiedContributorTagAdminData,
      ],
    });
  const grantOpenmeshAdminVerifiedContributorDepartmentTagCalls =
    grantOpenmeshAdminVerifiedContributorDepartmentTagDatas.map(
      (grantOpenmeshAdminVerifiedContributorDepartmentTagData) =>
        deployer.viem.encodeFunctionData({
          abi: openmeshAdminAbi,
          functionName: "performCall",
          args: [
            verifiedContributorTagManager,
            BigInt(0),
            grantOpenmeshAdminVerifiedContributorDepartmentTagData,
          ],
        })
    );
  const tagFirstVerifiedContributorDisputeCalls =
    tagFirstVerifiedContributorDatas.map(
      (tagFirstVerifiedContributorCoreMemberData) =>
        deployer.viem.encodeFunctionData({
          abi: openmeshAdminAbi,
          functionName: "performCall",
          args: [
            verifiedContributorTagManager,
            BigInt(0),
            tagFirstVerifiedContributorCoreMemberData,
          ],
        })
    );
  await deployer.execute({
    id: "GrantDepartmentAccessControlRolesAndMintInitialVerifiedContributors",
    abi: "OpenmeshAdmin",
    to: settings.smartAccounts.openmeshAdmin.admin,
    function: "multicall",
    args: [
      [
        ...grantDepartmentOwnerVerifiedContributorAdminCalls,
        grantOpenmeshAdminVerifiedContributorMintingCall,
        ...mintFirstVerifiedContributorCalls,
        grantDepartmentFactoryVerifiedContributorTagAdminCall,
        ...grantOpenmeshAdminVerifiedContributorDepartmentTagCalls,
        ...tagFirstVerifiedContributorDisputeCalls,
      ],
    ],
    chainId: settings.chainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
    ...getChainSettings(settings.chainId),
  });
  await deployer.finishContext();

  deployer.startContext("lib/openmesh-department");
  const disputeDepartment = await deployDepartment(deployer, {
    id: "DisputeDepartmentDAO",
    name: DepartmentTags.Dispute,
    departmentFactory: departmentFactory.departmentFactory,
    pluginSetupProcessor: aragonDeployment.PluginSetupProcessor
      .address as Address,
    chainId: settings.chainId,
    ...getChainSettings(settings.chainId),
  });
  const coreMemberDepartment = await deployDepartment(deployer, {
    id: "CoreMemberDepartmentDAO",
    name: DepartmentTags.CoreMember,
    departmentFactory: departmentFactory.departmentFactory,
    pluginSetupProcessor: aragonDeployment.PluginSetupProcessor
      .address as Address,
    chainId: settings.chainId,
    ...getChainSettings(settings.chainId),
  });
  const expertDepartment = await deployDepartment(deployer, {
    id: "ExpertDepartmentDAO",
    name: DepartmentTags.Expert,
    departmentFactory: departmentFactory.departmentFactory,
    pluginSetupProcessor: aragonDeployment.PluginSetupProcessor
      .address as Address,
    chainId: settings.chainId,
    ...getChainSettings(settings.chainId),
  });
  deployer.finishContext();

  deployer.startContext("lib/openmesh-admin");
  await deployer.execute({
    id: "TransferDisputeSmartAccountOwnershipToDepartmentDAO",
    abi: await deployer.getAbi("OpenmeshAdmin"),
    to: settings.smartAccounts.departments.disputeDepartment,
    function: "transferOwnership",
    args: [disputeDepartment.dao],
    chainId: settings.chainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
    ...getChainSettings(settings.chainId),
  });
  await deployer.execute({
    id: "TransferCoreMemberSmartAccountOwnershipToDepartmentDAO",
    abi: await deployer.getAbi("OpenmeshAdmin"),
    to: settings.smartAccounts.departments.coreMemberDepartment,
    function: "transferOwnership",
    args: [coreMemberDepartment.dao],
    chainId: settings.chainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
    ...getChainSettings(settings.chainId),
  });
  await deployer.execute({
    id: "TransferExpertSmartAccountOwnershipToDepartmentDAO",
    abi: await deployer.getAbi("OpenmeshAdmin"),
    to: settings.smartAccounts.departments.expertDepartment,
    function: "transferOwnership",
    args: [expertDepartment.dao],
    chainId: settings.chainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
    ...getChainSettings(settings.chainId),
  });
  await deployer.finishContext();

  return {
    verifiedContributor: verifiedContributor,
    verifiedContributorTagManager: verifiedContributorTagManager,
    verifiedContributorCountTrustlessManagement:
      verifiedContributorCountTrustlessManagement,
    verifiedContributorTagTrustlessManagement:
      verifiedContributorTagTrustlessManagement,
    departmentDaos: {
      departmentFactory: departmentFactory,
      disputeDepartment: disputeDepartment,
      coreMemberDepartment: coreMemberDepartment,
      expertDepartment: expertDepartment,
    },
  };
}
