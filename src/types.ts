export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type IncidentStatus = 'ACTIVE' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'SUPPRESSED';
export type CloudProvider = 'AWS' | 'GCP' | 'AZURE' | 'KUBERNETES';

export interface MitreAttack {
  tactic: string;
  technique: string;
  id: string;
}

export interface RawTelemetry {
  eventSource: string;
  eventName: string;
  sourceIPAddress: string;
  userAgent?: string;
  recipientAccountId?: string;
  requestParameters?: Record<string, any>;
  responseElements?: Record<string, any>;
  rawLog?: string;
}

export interface AIAnalysis {
  threatActorAnalysis?: string;
  rootCause?: string;
  blastRadius?: string;
  recommendedAction?: string;
  confidenceScore?: number;
  mitreChain?: string[];
  containmentPlaybookSteps?: string[];
  cisoSummary?: string;
}

export interface SecurityIncident {
  id: string;
  title: string;
  severity: Severity;
  category: 'Credential Access' | 'Data Exfiltration' | 'Privilege Escalation' | 'Cryptojacking' | 'Network Anomaly' | 'Configuration Drift';
  cloudProvider: CloudProvider;
  region: string;
  affectedResource: string;
  resourceType: 'IAM Role' | 'S3 Bucket' | 'EC2 Instance' | 'Cloud Function / Lambda' | 'Kubernetes Pod' | 'Service Account' | 'Security Group';
  mitreTactic: string;
  mitreTechnique: string;
  mitreId: string;
  timestamp: string;
  status: IncidentStatus;
  assignee: string;
  description: string;
  blastRadiusScore: number; // 1-100
  rawTelemetry: RawTelemetry;
  aiAnalysis?: AIAnalysis;
  playbookAvailable?: string;
}

export interface CloudAsset {
  id: string;
  name: string;
  provider: CloudProvider;
  region: string;
  type: 'Compute' | 'Storage' | 'IAM' | 'Network' | 'Container' | 'Database';
  riskScore: number; // 0-100
  status: 'Vulnerable' | 'Secure' | 'Warning' | 'Isolated';
  vulnerabilitiesCount: number;
  openPorts?: number[];
  compliancePassed: boolean;
  tags: Record<string, string>;
  lastScanned: string;
  remediationAction?: string;
}

export interface PlaybookStep {
  name: string;
  action: string;
  cliPreview: string;
  automated: boolean;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  category: 'Containment' | 'Eradication' | 'Forensics' | 'Recovery';
  targetType: string;
  automated: boolean;
  estimatedTime: string;
  runsCount: number;
  lastTriggered: string;
  steps: PlaybookStep[];
}

export interface ComplianceControl {
  id: string;
  title: string;
  framework: 'CIS' | 'SOC2' | 'ISO27001' | 'NIST' | 'PCI-DSS';
  status: 'PASSED' | 'FAILED' | 'WARNING';
  affectedResourcesCount: number;
  severity: Severity;
  description: string;
  remediationGuidance: string;
}

export interface ThreatFeedItem {
  id: string;
  type: 'IP' | 'DOMAIN' | 'SHA256' | 'CVE';
  value: string;
  threatGroup: string;
  confidence: number;
  malwareFamily: string;
  lastSeen: string;
  severity: Severity;
  reportsCount: number;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  provider: CloudProvider;
  service: string;
  eventName: string;
  principal: string;
  sourceIp: string;
  severity: Severity;
  isThreat: boolean;
}
