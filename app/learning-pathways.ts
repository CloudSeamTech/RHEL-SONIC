import { nessusCourses, nessusCourseHref } from '../lib/nessus-curriculum.ts';
import almaCourse from '../content/alma/desktop-lessons.json' with { type: 'json' };
import { lessons, modules } from './course.ts';
import {
  migrationCurriculum as migrationLessons,
  migrationParts,
} from './migration-curriculum.ts';

export type ConsoleLesson = {
  id: string;
  title: string;
  description: string;
  href: string;
  source: 'linux' | 'migration' | 'alma' | 'nessus';
  metadata: string;
  steps: string[];
};
export type LearningPathway = {
  id: string;
  title: string;
  prerequisite: string;
  sections: { title: string; optional?: boolean; lessons: ConsoleLesson[] }[];
};

const titles: Record<string, [string, string]> = {
  'lab-00': [
    'Choose Your Lab',
    'Choose the local lab route and record the hardware and budget you have available.',
  ],
  'lab-01': [
    'Understand the Lab Network',
    'Identify each server and its role in the source and destination environments.',
  ],
  'lab-02': [
    'Prepare Windows Server',
    'Download the required installers and check your workstation resources.',
  ],
  'lab-03': [
    'Build a Private Lab Network',
    'Create a VMware NAT network for your Windows lab servers.',
  ],
  'lab-04': [
    'Build DC01',
    'Install Windows Server on AG-DC01, configure its address, and create agency.test with AD DS and DNS.',
  ],
  'lab-07': [
    'Add DC02',
    'Build AG-DC02 in agency.test and verify Active Directory replication.',
  ],
  'lab-05': [
    'Create Users & Policy',
    'Create test users, organizational units, and a Group Policy in agency.test.',
  ],
  'lab-06': [
    'Build and Join APP01',
    'Join APP01 to agency.test and install an IIS test website.',
  ],
  'lab-08': [
    'Build the Destination Domain',
    'Create DEST-DC01 and a separate destination.test forest.',
  ],
  'lab-09': [
    'Configure DNS Between Forests',
    'Configure DNS resolution between agency.test and destination.test.',
  ],
  'lab-10': [
    'Move a Group Policy',
    'Export a test GPO and import it into the destination domain.',
  ],
  'lab-11': [
    'Move APP01 to the New Domain',
    'Move APP01 to destination.test and verify its application and policies.',
  ],
  'lab-12': [
    'Test the Rollback Plan',
    'Rehearse recovery from a domain move and record the result.',
  ],
  'sql-01': [
    'Choose the SQL Installer',
    'Choose supported SQL Server and Configuration Manager evaluation installers.',
  ],
  'sql-02': [
    'Build SQL01',
    'Create the SQL01 Windows server and join it to agency.test.',
  ],
  'sql-03': [
    'Install SQL Server',
    'Install and configure the SQL Server instance on SQL01.',
  ],
  'sql-04': [
    'Create a SQL Database',
    'Use SSMS to create a practice database and sample data.',
  ],
  'sql-05': [
    'Back Up and Restore a SQL Database',
    'Create a real database backup and restore it to prove recovery.',
  ],
  'lab-14': [
    'Plan the Azure Destination',
    'Plan the Azure identity environment and set a spending boundary.',
  ],
  'lab-15': [
    'Build AZ-DC01',
    'Create the Windows domain controller for your optional Azure destination forest.',
  ],
  'lab-16': [
    'Verify Private Connectivity',
    'Prove private network connectivity before moving a server into Azure.',
  ],
  'lab-17': [
    'Move a Server to Azure',
    'Rehearse one member-server migration after the private networking checks pass.',
  ],
  'move-01': [
    'Choose a Migration Method',
    'Inventory each workload and select a method that supports its dependencies.',
  ],
  'move-02': [
    'Move SQL Server Data to Azure',
    'Move only the practice database using a backup and restore workflow, then validate it.',
  ],
  'move-03': [
    'Plan a MECM Migration',
    'Compare supported approaches for preserving or replacing a Configuration Manager site.',
  ],
  'move-04': [
    'Plan Identity Changes',
    'Identify the account, computer, and application changes needed for a new domain.',
  ],
  'az-01': [
    'Set the Azure Lab Budget',
    'Estimate costs and limit the lab to one cloud VM at a time.',
  ],
  'az-02': [
    'Check Migration Tool Support',
    'Check that your migration tool supports the actual source hypervisor.',
  ],
  'upgrade-01': [
    'Upgrade Server 2019 to 2022 in Azure',
    'Upgrade the migrated APP02 member server in Azure and prove its application still works.',
  ],
  'az-03': [
    'Rehearse the Cutover',
    'Prepare a practice cutover plan with validation and rollback gates.',
  ],
  'lab-19': [
    'Troubleshoot a Failed Migration',
    'Follow the evidence tree to isolate a failed migration step.',
  ],
  'lab-13': [
    'Install WSUS',
    'Build a separate WSUS server and verify the update service.',
  ],
  'mecm-01': [
    'Build MECM01',
    'Create MECM01 and install the required Windows roles.',
  ],
  'mecm-02': [
    'Connect MECM to AD and SQL',
    'Grant MECM01 the required directory and SQL Server permissions.',
  ],
  'mecm-03': [
    'Install Configuration Manager',
    'Install an evaluation stand-alone primary site and verify its prerequisites.',
  ],
  'mecm-04': [
    'Add a Managed Client',
    'Add a Configuration Manager client and test its SQL dependency.',
  ],
  'mecm-05': [
    'Connect MECM to WSUS',
    'Connect the Software Update Point to WSUS01 and verify update management.',
  ],
  'ha-01': [
    'Understand SQL High Availability',
    'Explain how two SQL nodes and a cloud witness participate in cluster quorum.',
  ],
  'ha-02': [
    'Prepare SQL01 and SQL02',
    'Prepare two SQL nodes for a separate high availability lab after proving single-server recovery.',
  ],
  'ha-03': [
    'Create a Cloud Witness',
    'Create the Azure storage account that will hold the cluster witness blob.',
  ],
  'ha-04': [
    'Configure Cluster Quorum',
    'Configure a healthy Windows Failover Cluster to use the Azure cloud witness.',
  ],
  'ha-05': [
    'Test Quorum and Clean Up',
    'Test quorum safely and distinguish cluster voting from database replication.',
  ],
  'lab-18': [
    'Explain the Migration Plan',
    'Rehearse the migration sequence using the interview drill and checklist.',
  ],
  'lab-20': [
    'Shut Down the Lab',
    'Stop or remove cloud resources deliberately and retain your learning evidence.',
  ],
  'field-01': [
    'Review an Existing Migration',
    'Ask ten handoff questions to establish the project state before making changes.',
  ],
};

const linuxTitles: Record<string, string> = {
  'assignment-v2': 'Plan the Lab Change',
  'windows-tools-v2': 'Check Windows Tools',
  'azure-scope-v2': 'Set the Azure Budget',
  'two-host-plan-v3': 'Plan Two RHEL Servers',
  'resource-group-v2': 'Create a Resource Group',
  'network-plan-v2': 'Build a VNet and Subnet',
  'build-storage-v3': 'Plan Disks and Mount Points',
  'nsg-v2': 'Restrict SSH Access',
  'key-concept-v2': 'Understand SSH Keys',
  'key-create-v2': 'Create an SSH Key Pair',
  'vm-provision-v2': 'Build the RHEL Endpoint',
  'manager-vm-v3': 'Build the RHEL Manager',
  'reachability-v2': 'Test Network Access',
  'host-trust-v2': 'Verify the Host Fingerprint',
  'first-ssh-v2': 'Connect to RHEL with SSH',
  'identity-v2': 'Check User Privileges',
  'host-os-v2': 'Identify the RHEL System',
  'guest-network-v2': 'Check IP Addresses and Routes',
  'home-files-v2': 'Explore Linux Files',
  'storage-verify-v3': 'Verify Linux Storage',
  'paired-access-v3': 'Verify Access to Both Hosts',
  'test-file-v3': 'Create a Test File',
  'scp-test-v3': 'Copy a File with SCP',
  'verify-transfer-v3': 'Verify the Copied File',
  'sftp-test-v3': 'Transfer a File with SFTP',
  'installer-types-v3': 'Choose an Install Method',
  'software-inventory-v3': 'Record Installed Software',
  'baseline-v2': 'Capture the Server Baseline',
  'rollback-gate-v3': 'Prepare the Rollback Plan',
  'deallocate-v2': 'Pause the Azure Lab',
  'wazuh-release-v4': 'Check the Wazuh Release',
  'wazuh-central-v4': 'Install the Wazuh Manager',
  'wazuh-dashboard-v4': 'Verify Wazuh Services',
  'wazuh-artifact-v4': 'Verify the Agent Package',
  'wazuh-agent-v4': 'Install the Wazuh Agent',
  'wazuh-checkin-v4': 'Verify Agent Check-In',
  'wazuh-event-v4': 'Test Event Delivery',
  'wazuh-fault-v4': 'Troubleshoot Agent Connectivity',
  'wazuh-recover-v4': 'Recover the Wazuh Agent',
  'wazuh-close-v4': 'Close the Lab Change',
};

function migration(ids: string[]): ConsoleLesson[] {
  return ids.flatMap(migrationParts).map((id) => {
    const lesson = migrationLessons.find((item) => item.id === id);
    if (!lesson) throw new Error(`Unknown pathway lesson: ${id}`);
    const [title, description] = (lesson.separated
      ? [lesson.title, lesson.description!]
      : titles[id]) ?? [
      lesson.title,
      lesson.body
        .split('\n')
        .find((line) => line.trim() && !line.startsWith('#'))!,
    ];
    return {
      id,
      title,
      description,
      href: `/migration#lesson=${id}`,
      source: 'migration',
      metadata: lesson.surface,
      steps: [
        'Read the prerequisites and identify the named machine',
        'Follow the lesson actions in your own lab',
        'Compare your evidence with the pass checks',
        'Record the result before marking verified',
      ],
    };
  });
}

export const learningPathways: LearningPathway[] = [
  {
    id: 'windows',
    title: 'Windows Server & Active Directory',
    prerequisite: 'Start here · local VMware lab',
    sections: [
      {
        title: '01 / Prepare the Lab',
        lessons: migration(['lab-00', 'lab-01', 'lab-02', 'lab-03']),
      },
      {
        title: '02 / Build DC01 and DC02',
        lessons: migration(['lab-04', 'lab-07', 'lab-05', 'lab-06']),
      },
      {
        title: '03 / MECM Extension',
        optional: true,
        lessons: migration([
          'lab-13',
          'mecm-01',
          'mecm-02',
          'mecm-03',
          'mecm-04',
          'mecm-05',
        ]),
      },
    ],
  },
  {
    id: 'sql',
    title: 'SQL Server',
    prerequisite: 'After Windows / AD · SQL01 needs agency.test',
    sections: [
      {
        title: '01 / Install and Recover SQL',
        lessons: migration(['sql-01', 'sql-02', 'sql-03', 'sql-04', 'sql-05']),
      },
      {
        title: '02 / High Availability',
        optional: true,
        lessons: migration(['ha-01', 'ha-02', 'ha-03', 'ha-04', 'ha-05']),
      },
    ],
  },
  {
    id: 'azure',
    title: 'Microsoft Azure',
    prerequisite: 'After Windows / AD · review costs first',
    sections: [
      {
        title: '01 / Build the Destination',
        lessons: migration(['az-01', 'lab-14', 'lab-15', 'lab-16']),
      },
    ],
  },
  {
    id: 'migrations',
    title: 'Cloud Migrations',
    prerequisite: 'After Windows, SQL, and Azure foundations',
    sections: [
      {
        title: '01 / Plan the Move',
        lessons: migration(['field-01', 'move-01', 'move-04']),
      },
      {
        title: '02 / Move Between Domains',
        lessons: migration(['lab-08', 'lab-09', 'lab-10', 'lab-11', 'lab-12']),
      },
      {
        title: '03 / Move to Azure',
        lessons: migration([
          'az-02',
          'lab-17',
          'upgrade-01',
          'az-03',
          'move-02',
        ]),
      },
      {
        title: '04 / Verify and Close',
        lessons: migration(['lab-19', 'lab-18', 'lab-20']),
      },
      {
        title: '05 / MECM Migration',
        optional: true,
        lessons: migration(['move-03']),
      },
    ],
  },
  {
    id: 'linux',
    title: 'Linux Administration',
    prerequisite: 'Separate RHEL / Wazuh pathway · Azure subscription required',
    sections: modules
      .filter((module) => module.lessonIds.length)
      .map((module) => ({
        title: module.title,
        lessons: module.lessonIds.map((id) => {
          const lesson = lessons.find((item) => item.id === id)!;
          return {
            id,
            title: linuxTitles[id] ?? lesson.title,
            description: lesson.objective,
            href: `/#lesson=${id}`,
            source: 'linux' as const,
            metadata: lesson.shell,
            steps: [
              'Read the task and check the target host',
              'Follow the guided commands in your own lab',
              'Verify the expected output',
              'Record evidence and mark verified',
            ],
          };
        }),
      })),
  },
  {
    id: 'alma',
    title: 'AlmaLinux Desktop Experience',
    prerequisite: 'Day-to-day operations · AlmaLinux 9 GNOME · VMware-first',
    sections: [
      ...new Set(almaCourse.lessons.map((lesson) => lesson.section)),
    ].map((title) => ({
      title,
      lessons: almaCourse.lessons
        .filter((lesson) => lesson.section === title)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          href: `/alma#lesson=${lesson.id}`,
          source: 'alma' as const,
          metadata: 'AlmaLinux 9 / GNOME / your own lab',
          steps: lesson.guide.steps.map((step) => step.title),
        })),
    })),
  },
  ...nessusCourses.map((course) => ({
    id: course.id,
    title: course.title,
    prerequisite: course.prerequisite,
    sections: [
      {
        title: 'Guided lessons / in order',
        lessons: course.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          href: `${nessusCourseHref(course.id)}#lesson=${lesson.id}`,
          source: 'nessus' as const,
          metadata: course.baseline,
          steps: lesson.steps.map((step) => step.title),
        })),
      },
    ],
  })),
];

export const pathwayLessons = (pathway: LearningPathway) =>
  pathway.sections.flatMap((section) => section.lessons);

// Core lesson pagination follows the prerequisite route. Optional extensions
// stay within their own sequence instead of interrupting the core route.
export function lessonSequenceFor(id: string): ConsoleLesson[] {
  if (id.startsWith('nessus-')) {
    const pathway = learningPathways.find((path) =>
      path.sections.some((section) =>
        section.lessons.some((lesson) => lesson.id === id),
      ),
    );
    return pathway ? pathwayLessons(pathway) : [];
  }
  if (id.startsWith('alma-'))
    return pathwayLessons(learningPathways.find((path) => path.id === 'alma')!);
  const sections = learningPathways
    .filter(
      (pathway) =>
        !['linux', 'alma'].includes(pathway.id) &&
        !pathway.id.startsWith('nessus-'),
    )
    .flatMap((pathway) => pathway.sections);
  const optional = sections.find(
    (section) =>
      section.optional && section.lessons.some((lesson) => lesson.id === id),
  );
  return (
    optional?.lessons ??
    sections
      .filter((section) => !section.optional)
      .flatMap((section) => section.lessons)
  );
}
