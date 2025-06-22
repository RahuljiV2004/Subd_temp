// // export interface Subdomain {
// //   domain: string;
// //   ip: string[];
// //   http: [number, string, null | string];
// //   https: [number, null | string, string];
// //   cert: [boolean, string, string];
// //   cert_details: {
// //     subject_common_name: string;
// //     issuer_common_name: string;
// //     valid_from: string;
// //     valid_to: string;
// //     serial_number: string;
// //     full_raw: {
// //       subject: [string[][]];
// //       issuer: [string[][]];
// //       version: number;
// //       serialNumber: string;
// //       notBefore: string;
// //       notAfter: string;
// //       subjectAltName: [string[]];
// //       OCSP: string[];
// //       caIssuers: string[];
// //       crlDistributionPoints: string[];
// //     };
// //   };
// // }
// export interface Subdomain {
//   domain: string;
//   ip: string[];
//   http: [number, string, null | string];
//   https: [number, null | string, string];
//   cert: [boolean, string, string];
//   cert_details: {
//     subject_common_name: string;
//     issuer_common_name: string;
//     valid_from: string;
//     valid_to: string;
//     serial_number: string;
//     full_raw: {
//       subject: [string[][]];
//       issuer: [string[][]];
//       version: number;
//       serialNumber: string;
//       notBefore: string;
//       notAfter: string;
//       subjectAltName: [string[]];
//       OCSP: string[];
//       caIssuers: string[];
//       crlDistributionPoints: string[];
//     };
//   };

//   // ✅ New: DNSDumpster results
//   dnsdumpster: {
//     a_records: string[];
//     mx_records: string[];
//     txt_records?: string[];           // Optional additional fields
//     cname_records?: string[];
//     ns_records?: string[];
//   };

//  mxtoolbox: {
//   commandArgument: string;
//   TimeRecorded: string;
//   TimeToComplete: number;
//   ReportingNameServer: string;
//   isEndpoint: boolean;
//   isEmptySubDomain: boolean;
//   mx_records?: string[]; // optional: populated from `Records` or similar
//   failed?: string[];
//   Timeouts?: {
//   ID: number;
//   Name: string;
//   Info: string; // may contain HTML like <p>...</p>
//   Url: string | null;
//   PublicDescription: string | null;
//   IsExcludedByUser: boolean;
// }[];

//   errors?: string[];
//   Warnings?:{
//     Name: string,
//     Info: string
//   }[];
//   Information?: {
//   Type: string;
//   "Domain Name": string;
//   "IP Address": string;
//   TTL: string;
//   Status: string;
//   Time: string;
//   Auth: string;
//   Parent: string;
//   Local: string;
//   Asn: string;
//   IsIPv6: string;
// }[];
//   RelatedLookups?: {
//     Name: string;
//     Url: string;
//     Command: string;
//     CommandArgument: string;
//   }[];
  
// };

// Nmap?: {
//   target: string;
//   open_ports: number[];
// };

//   // ✅ New: Open Ports (from Nmap or similar)
  
// }

export interface Subdomain {
  name: string;
  domain: string;
  ip: string[];
  status: string;
  lastSeen: string;
  firstSeen: string;
  technologies: string[];
  vulnerabilities: Vulnerability[];
  http: [number, string, null];
  https: [number, string, null];
  cert: [boolean];
}
export interface SubdomainKnockpy {
  name: string;
  domain: string;
  ip: string[];
  status: string;
  lastSeen: string;
  firstSeen: string;
  technologies: string[];
  vulnerabilities: Vulnerability[];
  http: [number, string, null];
  https: [number, string, null];
  cert: [boolean];
}

export interface SubdomainSubfinder {
  subdomain: string;
  httpx_status_code: number;
  httpx_a: string[];
  httpx_tls_probe_status: boolean;
  
}

export interface Vulnerability {
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  cve?: string;
}

export interface TrendData {
  date: string;
  subdomains: number;
  vulnerabilities: number;
}

export const mockSubdomains: Subdomain[] = [
  {
    name: 'example.com',
    domain: 'example.com',
    ip: ['93.184.216.34'],
    status: 'active',
    lastSeen: '2024-03-20',
    firstSeen: '2024-01-01',
    technologies: ['Nginx', 'PHP'],
    vulnerabilities: [],
    http: [200, 'OK', null],
    https: [200, 'OK', null],
    cert: [true]
  }
];

export const mockTrendData: TrendData[] = [
  {
    date: '2024-01',
    subdomains: 10,
    vulnerabilities: 2
  },
  {
    date: '2024-02',
    subdomains: 15,
    vulnerabilities: 3
  },
  {
    date: '2024-03',
    subdomains: 20,
    vulnerabilities: 4
  }
];
