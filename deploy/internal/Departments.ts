import { Deployer, Address } from "../../web3webdeploy/types";
import { getChainSettings, testSalt } from "../deploy";

import {
  VerifiedContributorDeployment,
  deploy as verifiedContributorDeploy,
} from "../../lib/verified-contributor/deploy/deploy";
import { deployOptimisticActions } from "../../lib/trustless-actions/deploy/internal/OptimisticActions";
import { deploy as aragonTagVotingDeploy } from "../../lib/aragon-tag-voting/deploy/deploy";
import {
  deployDepartmentFactory,
  DeployDepartmentFactoryReturn,
} from "../../lib/openmesh-department/deploy/internal/DepartmentFactory";
import { deploySmartAccountDepartmentInstaller } from "../../lib/openmesh-department/deploy/internal/SmartAccountDepartmentInstaller";
import {
  deployDepartment,
  DeployDepartmentReturn,
} from "../../lib/openmesh-department/deploy/internal/Department";
import {
  SupportedNetworks,
  SupportedVersions,
  getNetworkDeploymentForVersion,
} from "../../lib/osx-commons/configs/src";
import { SmartAccountBaseContract } from "../../lib/openmesh-admin/lib/smart-account/export/SmartAccountBase";
import { SmartAccountBaseInstallerContract } from "../../lib/openmesh-admin/lib/smart-account/export/Mumbai/SmartAccountBaseInstaller";
import { SmartAccountTrustlessExecutionContract } from "../../lib/openmesh-admin/lib/smart-account/export/Mumbai/SmartAccountTrustlessExecution";
import { SmartAccountsDeployment } from "./SmartAccounts";
import { OpenRDDeployment } from "./OpenRD";

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
  addressTrustlessManagement: Address;
}

export interface DepartmentsDeployment {
  verifiedContributor: VerifiedContributorDeployment;
  verifiedContributorTagManager: Address;
  verifiedContributorCountTrustlessManagement: Address;
  verifiedContributorTagTrustlessManagement: Address;
  departmentDaos: {
    departmentFactory: DeployDepartmentFactoryReturn;
    smartAccountDepartmentInstaller: Address;
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
    verifiedContributorSettings: {
      chainId: settings.chainId,
      salt: testSalt ?? undefined,
      ...getChainSettings(settings.chainId),
    },
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
      salt: testSalt ?? undefined,
      ...getChainSettings(settings.chainId),
    })
    .then((deployment) => deployment.address);
  deployer.finishContext();
  deployer.startContext("lib/trustless-management");
  const verifiedContributorCountTrustlessManagement = await deployer
    .deploy({
      id: "VerifiedContributorCountTrustlessManagement",
      contract: "ERC721CountTrustlessManagement",
      args: [verifiedContributorTagManager],
      chainId: settings.chainId,
      salt: testSalt ?? undefined,
      ...getChainSettings(settings.chainId),
    })
    .then((deployment) => deployment.address);
  const verifiedContributorTagTrustlessManagement = await deployer
    .deploy({
      id: "VerifiedContributorTagTrustlessManagement",
      contract: "TagTrustlessManagement",
      args: [verifiedContributorTagManager],
      chainId: settings.chainId,
      salt: testSalt ?? undefined,
      ...getChainSettings(settings.chainId),
    })
    .then((deployment) => deployment.address);
  deployer.finishContext();
  deployer.startContext("lib/trustless-actions");
  const optimisticActions = await deployOptimisticActions(deployer, {
    chainId: settings.chainId,
    salt: testSalt ?? undefined,
    ...getChainSettings(settings.chainId),
  });
  deployer.finishContext();
  deployer.startContext("lib/aragon-tag-voting");
  const aragonTagVoting = await aragonTagVotingDeploy(deployer, {
    aragonDeployment: aragonDeployment,
    tagVotingSetupSettings: {
      chainId: settings.chainId,
      salt: testSalt ?? undefined,
      ...getChainSettings(settings.chainId),
    },
    tagVotingRepoSettings: {
      subdomain: "tagvoting" + (testSalt ?? undefined),
      maintainer: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
      chainId: settings.chainId,
      ...getChainSettings(settings.chainId),
    },
  });
  deployer.finishContext();
  deployer.startContext("lib/openmesh-department");
  const departmentFactory = await deployDepartmentFactory(deployer, {
    pluginSetupProcessor: aragonDeployment.PluginSetupProcessor
      .address as Address,
    tagManager: verifiedContributorTagManager,
    tagVotingRepo: aragonTagVoting.tagVotingRepo,
    departmentOwnerSettings: {
      metadata: "0x",
      tokenVoting: aragonDeployment.TokenVotingRepoProxy.address as Address,
      token: verifiedContributor.verifiedContributor,
      trustlessManagement: verifiedContributorCountTrustlessManagement,
      role: BigInt(1),
      addressTrustlessManagement: settings.addressTrustlessManagement,
      optimisticActions: optimisticActions,
    },
    chainId: settings.chainId,
    salt: testSalt ?? undefined,
    ...getChainSettings(settings.chainId),
  });
  deployer.finishContext();

  const departmentOwnerRoles = [
    deployer.viem.zeroHash, // Default Admin Role
    deployer.viem.keccak256(deployer.viem.toBytes("MINT")),
    deployer.viem.keccak256(deployer.viem.toBytes("BURN")),
  ] as const;
  const tagsToGrantToDepartments = [
    {
      address: settings.smartAccounts.departments.disputeDepartment,
      tag: DepartmentTags.Dispute,
    },
    {
      address: settings.smartAccounts.departments.coreMemberDepartment,
      tag: DepartmentTags.CoreMember,
    },
    {
      address: settings.smartAccounts.departments.expertDepartment,
      tag: DepartmentTags.Expert,
    },
  ] as const;

  const tagsToGrantForInitialVerifiedContributors = [
    DepartmentTags.Dispute,
    DepartmentTags.CoreMember,
    DepartmentTags.Expert,
  ] as const;
  const initialVerifiedContributors = [
    {
      address: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
      tags: [
        DepartmentTags.Dispute,
        DepartmentTags.CoreMember,
        DepartmentTags.Expert,
      ],
    },
  ] as const;

  deployer.startContext("lib/verified-contributor");
  const verifiedContributorAbi = await deployer.getAbi("VerifiedContributor");
  const grantDepartmentOwnerVerifiedContributorRoleDatas =
    departmentOwnerRoles.map((role) =>
      deployer.viem.encodeFunctionData({
        abi: verifiedContributorAbi,
        functionName: "grantRole",
        args: [role, departmentFactory.departmentOwner.dao],
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
  const grantDepartmentVerifiedContributorTagDatas =
    tagsToGrantToDepartments.map((department) =>
      deployer.viem.encodeFunctionData({
        abi: tagManagerAbi,
        functionName: "grantRole",
        args: [
          deployer.viem.keccak256(deployer.viem.toBytes(department.tag)),
          department.address,
        ],
      })
    );
  const grantOpenmeshAdminVerifiedContributorTagDatas =
    tagsToGrantForInitialVerifiedContributors.map((tag) =>
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
  const openmeshAdminAbi = [...SmartAccountBaseContract.abi]; // await deployer.getAbi("OpenmeshAdmin");
  const performCall = (address: Address, data: `0x${string}`) => {
    return deployer.viem.encodeFunctionData({
      abi: openmeshAdminAbi,
      functionName: "performCall",
      args: [address, BigInt(0), data],
    });
  };
  await deployer.execute({
    id: "GrantDepartmentAccessControlRolesAndMintInitialVerifiedContributors",
    abi: openmeshAdminAbi,
    to: settings.smartAccounts.openmeshAdmin.admin,
    function: "multicall",
    args: [
      [
        ...grantDepartmentOwnerVerifiedContributorRoleDatas.map((data) =>
          performCall(verifiedContributor.verifiedContributor, data)
        ),
        ...grantDepartmentVerifiedContributorTagDatas.map((data) =>
          performCall(verifiedContributorTagManager, data)
        ),
        performCall(
          verifiedContributor.verifiedContributor,
          grantOpenmeshAdminVerifiedContributorMintingData
        ),
        ...mintFirstVerifiedContributorDatas.map((data) =>
          performCall(verifiedContributor.verifiedContributor, data)
        ),
        ...grantOpenmeshAdminVerifiedContributorTagDatas.map((data) =>
          performCall(verifiedContributorTagManager, data)
        ),
        ...tagFirstVerifiedContributorDatas.map((data) =>
          performCall(verifiedContributorTagManager, data)
        ),
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

  const smartAccountDepartmentInstaller =
    await deploySmartAccountDepartmentInstaller(deployer, {
      smartAccountTrustlessExecution:
        SmartAccountTrustlessExecutionContract.address,
      tagTrustlessManagement: verifiedContributorTagTrustlessManagement,
      addressTrustlessManagement: settings.addressTrustlessManagement,
      optimisticActions: optimisticActions,
      openRD: settings.openRD.openRD.tasks,
      chainId: settings.chainId,
      salt: testSalt ?? undefined,
      ...getChainSettings(settings.chainId),
    });
  const smartAccountDepartmentInstallerAbi = await deployer.getAbi(
    "SmartAccountDepartmentInstaller"
  );
  const smartAccountDepartmentInstallCall = (tag: DepartmentTags) => {
    return deployer.viem.encodeFunctionData({
      abi: openmeshAdminAbi,
      functionName: "performDelegateCall",
      args: [
        smartAccountDepartmentInstaller,
        deployer.viem.encodeFunctionData({
          abi: smartAccountDepartmentInstallerAbi,
          functionName: "install",
          args: [deployer.viem.keccak256(deployer.viem.toBytes(tag))],
        }),
      ],
    });
  };
  deployer.finishContext();

  deployer.startContext("lib/openmesh-admin");
  const transferOwnershipCall = (newOwner: Address) => {
    return deployer.viem.encodeFunctionData({
      abi: openmeshAdminAbi,
      functionName: "performDelegateCall",
      args: [
        SmartAccountBaseInstallerContract.address,
        deployer.viem.encodeFunctionData({
          abi: SmartAccountBaseInstallerContract.abi,
          functionName: "transferOwnership",
          args: [newOwner],
        }),
      ],
    });
  };
  await deployer.execute({
    id: "FinalizeDisputeSmartAccount",
    abi: openmeshAdminAbi,
    to: settings.smartAccounts.departments.disputeDepartment,
    function: "multicall",
    args: [
      [
        smartAccountDepartmentInstallCall(DepartmentTags.Dispute),
        transferOwnershipCall(disputeDepartment.dao),
      ],
    ],
    chainId: settings.chainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
    ...getChainSettings(settings.chainId),
  });
  await deployer.execute({
    id: "FinalizeCoreMemberSmartAccount",
    abi: openmeshAdminAbi,
    to: settings.smartAccounts.departments.coreMemberDepartment,
    function: "multicall",
    args: [
      [
        smartAccountDepartmentInstallCall(DepartmentTags.CoreMember),
        transferOwnershipCall(coreMemberDepartment.dao),
      ],
    ],
    chainId: settings.chainId,
    from: "0x2309762aAcA0a8F689463a42c0A6A84BE3A7ea51",
    ...getChainSettings(settings.chainId),
  });
  await deployer.execute({
    id: "FinalizeExpertSmartAccount",
    abi: openmeshAdminAbi,
    to: settings.smartAccounts.departments.expertDepartment,
    function: "multicall",
    args: [
      [
        smartAccountDepartmentInstallCall(DepartmentTags.Expert),
        transferOwnershipCall(expertDepartment.dao),
      ],
    ],
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
      smartAccountDepartmentInstaller: smartAccountDepartmentInstaller,
      disputeDepartment: disputeDepartment,
      coreMemberDepartment: coreMemberDepartment,
      expertDepartment: expertDepartment,
    },
  };
}
