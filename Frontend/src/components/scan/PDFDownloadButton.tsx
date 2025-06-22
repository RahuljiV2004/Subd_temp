// import React, { useState } from 'react';
// import { Download } from 'lucide-react';
// import jsPDF from 'jspdf';
// // import type { Subdomain } from '../../types/subdomain';

// interface PDFDownloadButtonProps {
//   subdomain: Subdomain;
// }

// export default function PDFDownloadButton({ subdomain }: PDFDownloadButtonProps) {
//   const [isGenerating, setIsGenerating] = useState(false);

//   const generatePDF = async () => {
//     setIsGenerating(true);
    
//     try {
//       const pdf = new jsPDF();
//       const pageWidth = pdf.internal.pageSize.width;
//       const pageHeight = pdf.internal.pageSize.height;
//       const margin = 20;
//       const contentWidth = pageWidth - (margin * 2);
//       let yPosition = margin;

//       // Helper function to add a new page if needed
//       const checkPageBreak = (requiredHeight: number) => {
//         if (yPosition + requiredHeight > pageHeight - margin) {
//           pdf.addPage();
//           yPosition = margin;
//         }
//       };

//       // Helper function to add text with word wrapping
//       const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
//         pdf.setFontSize(fontSize);
//         const lines = pdf.splitTextToSize(text, maxWidth);
//         pdf.text(lines, x, y);
//         return lines.length * (fontSize * 0.4);
//       };

//       // Header
//       pdf.setFillColor(15, 23, 42); // slate-900
//       pdf.rect(0, 0, pageWidth, 50, 'F');
      
//       pdf.setTextColor(255, 255, 255);
//       pdf.setFontSize(24);
//       pdf.setFont('helvetica', 'bold');
//       pdf.text('SUBDOMAIN SECURITY REPORT by IITM', margin, 25);
      
//       pdf.setFontSize(14);
//       pdf.setFont('helvetica', 'normal');
//       pdf.text(subdomain.domain, margin, 35);

//       // Report generation date
//       pdf.setFontSize(10);
//       pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 80, 35);

//       yPosition = 65;

//       // Section divider function
//       const addSectionHeader = (title: string) => {
//         checkPageBreak(25);
//         pdf.setFillColor(34, 197, 94); // green-500
//         pdf.rect(margin, yPosition - 5, contentWidth, 20, 'F');
        
//         pdf.setTextColor(255, 255, 255);
//         pdf.setFontSize(12);
//         pdf.setFont('helvetica', 'bold');
//         pdf.text(`${title}`, margin + 5, yPosition + 7);
        
//         yPosition += 25;
//         pdf.setTextColor(0, 0, 0);
//       };

//       // Content helper function
//       const addField = (label: string, value: string, isMultiline: boolean = false) => {
//         checkPageBreak(isMultiline ? 30 : 15);
        
//         pdf.setFont('helvetica', 'bold');
//         pdf.setFontSize(10);
//         pdf.setTextColor(191, 64, 191); // purple color for labels
//         pdf.text(`${label}:`, margin + 5, yPosition);
        
//         pdf.setFont('helvetica', 'normal');
//         pdf.setTextColor(0, 0, 0);
        
//         if (isMultiline) {
//           const textHeight = addWrappedText(value, margin + 5, yPosition + 8, contentWidth - 10, 10);
//           yPosition += Math.max(textHeight + 5, 15);
//         } else {
//           pdf.text(value, margin + 60, yPosition);
//           yPosition += 12;
//         }
//       };

//       // Basic Information
//       addSectionHeader('Basic Information');
//       addField('Domain', subdomain.domain);
//       addField('IP Addresses', subdomain.ip.join(', '), true);

//       yPosition += 10;

//       // HTTP Status
//       addSectionHeader('HTTP Status');
//       addField('HTTP Status', `${subdomain.http[0]} - ${subdomain.http[1]}`);
//       addField('HTTPS Status', `${subdomain.https[0]} - ${subdomain.https[2]}`);

//       yPosition += 10;

//       // Open Ports
//       addSectionHeader('Open Ports');
//       const ports = subdomain.nmap?.open_ports || [];
//       addField('Discovered Ports', ports.length > 0 ? ports.join(', ') : 'No open ports found', true);

//       yPosition += 10;

//       // SSL Certificate
//       addSectionHeader('SSL Certificate');
//       addField('Status', subdomain.cert[0] ? 'Secure (Valid Certificate)' : 'Insecure (No Valid Certificate)');
//       addField('Expiry Date', subdomain.cert[1] || 'N/A');
//       addField('Subject', subdomain.cert_details?.subject_common_name || 'N/A');
//       addField('Issuer', subdomain.cert_details?.issuer_common_name || 'N/A');

//       yPosition += 10;

//       // Certificate Details
//       addSectionHeader('Certificate Details');
//       addField('Serial Number', subdomain.cert_details?.serial_number || 'N/A', true);
//       addField('Valid From', subdomain.cert_details?.valid_from || 'N/A');
//       addField('Valid To', subdomain.cert_details?.valid_to || 'N/A');

//       yPosition += 10;

//       // Tech Stack
//       addSectionHeader('Technology Stack (WhatWeb)');
//       const plugins = subdomain.whatweb?.plugins || {};
//       const techStackEntries = Object.entries(plugins).map(([pluginName, pluginData]) => {
//         const extractValues = (obj: any): string[] => {
//           let results: string[] = [];
//           for (const key in obj) {
//             const val = obj[key];
//             if (key === "string" && Array.isArray(val)) {
//               results = results.concat(val);
//             } else if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
//               results.push(String(val));
//             } else if (typeof val === "object" && val !== null) {
//               const keys = Object.keys(val);
//               const isIndexed = keys.every(k => /^\d+$/.test(k));
//               if (isIndexed) {
//                 results = results.concat(Object.values(val).map(String));
//               } else {
//                 results = results.concat(extractValues(val));
//               }
//             }
//           }
//           return results;
//         };

//         const values = extractValues(pluginData).filter(v => v !== '' && v !== null && v !== undefined);
//         return values.length ? `${pluginName}-> ${values.join(', ')}` : null;
//       }).filter(Boolean);

//       if (techStackEntries.length > 0) {
//         techStackEntries.forEach(entry => {
//           if (entry) addField('', entry, true);
//         });
//       } else {
//         addField('Technologies', 'No technologies detected');
//       }

//       yPosition += 10;

//       // DNS Information
//       addSectionHeader('DNS Information (DNSDumpster)');
//       const aRecords = subdomain.dnsdumpster?.a_records || [];
//       const mxRecords = subdomain.dnsdumpster?.mx_records || [];
      
//       addField('A Records', aRecords.length > 0 ? aRecords.join(', ') : 'None found', true);
//       addField('MX Records', mxRecords.length > 0 ? mxRecords.join(', ') : 'None found', true);

//       yPosition += 10;

//       // MXToolbox Information
//       addSectionHeader('MXToolbox Analysis');
//       if (subdomain.mxtoolbox) {
//         addField('Scan Time', subdomain.mxtoolbox.TimeRecorded || 'N/A');
//         addField('Duration', subdomain.mxtoolbox.TimeToComplete ? `${subdomain.mxtoolbox.TimeToComplete}s` : 'N/A');
//         addField('Reporting Server', subdomain.mxtoolbox.ReportingNameServer || 'N/A');
        
//         const info = subdomain.mxtoolbox.Information || [];
//         if (info.length > 0) {
//           info.forEach((infoItem: any, index: number) => {
//             checkPageBreak(40);
//             pdf.setFont('helvetica', 'bold');
//             pdf.setFontSize(9);
//             pdf.setTextColor(191, 64, 191);
//             pdf.text(`DNS Record ${index + 1}:`, margin + 5, yPosition);
//             yPosition += 10;
            
//             pdf.setFont('helvetica', 'normal');
//             pdf.setTextColor(0, 0, 0);
//             pdf.setFontSize(8);
//             pdf.text(`Type: ${infoItem.Type || 'N/A'}`, margin + 10, yPosition);
//             yPosition += 8;
//             pdf.text(`IP: ${infoItem["IP Address"] || 'N/A'}`, margin + 10, yPosition);
//             yPosition += 8;
//             pdf.text(`TTL: ${infoItem.TTL || 'N/A'}`, margin + 10, yPosition);
//             yPosition += 8;
//             pdf.text(`Status: ${infoItem.Status || 'N/A'}`, margin + 10, yPosition);
//             yPosition += 12;
//           });
//         }
//       } else {
//         addField('MXToolbox Data', 'No MXToolbox analysis available');
//       }

//       // Footer
//       const totalPages = pdf.internal.pages.length - 1;
//       for (let i = 1; i <= totalPages; i++) {
//         pdf.setPage(i);
//         pdf.setFillColor(15, 23, 42);
//         pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        
//         pdf.setTextColor(255, 255, 255);
//         pdf.setFontSize(8);
//         pdf.text(`Subdomain Security Report - ${subdomain.domain}`, margin, pageHeight - 8);
//         pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 8);
//       }

//       // Download the PDF
//       pdf.save(`${subdomain.domain}_security_report.pdf`);
      
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       alert('Failed to generate PDF. Please try again.');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <button
//       onClick={generatePDF}
//       disabled={isGenerating}
//       className={`text-base px-4 py-1.5 rounded-full border text-green-400 transition flex items-center gap-2 
//         ${isGenerating
//           ? "bg-green-500/30 border-green-500/50 cursor-not-allowed"
//           : "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"}`}
//     >
//       <Download className={`w-4 h-4 ${isGenerating ? "animate-pulse" : ""}`} />
//       {isGenerating ? "one sec" : "PDF"}
//     </button>
//   );
// }
import React, { useState } from 'react';
import { Download, FileText, Shield, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import type { Subdomain } from '../types/subdomain';

interface PDFDownloadButtonProps {
  subdomain: Subdomain;
}

export default function PDFDownloadButton({ subdomain }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const img = new Image();


  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;
//       img.src = 'https://media.licdn.com/dms/image/v2/D560BAQEPEwnV8TMpSQ/company-logo_200_200/company-logo_200_200/0/1728124533458?e=2147483647&v=beta&t=fZUf-nIj-5P4SiI_cFGbaMQxqMl1AOIqZqKSegdOs6U';
// img.onload = function() {
//   pdf.addImage(img, 'PNG', margin, 15, 40, 30);
//   pdf.save('my-report.pdf');
// };
      // Helper function to add a new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return lines.length * (fontSize * 0.4);
      };

      // Header with gradient effect
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, pageWidth, 60, 'F');
      
      // // Add CyStar logo area (simulated with text since we can't embed images easily)
      // pdf.setFillColor(59, 130, 246); // blue-500
      // pdf.roundedRect(margin, 15, 40, 30, 5, 5, 'F');
      
      // pdf.setTextColor(255, 255, 255);
      // pdf.setFontSize(16);
      // pdf.setFont('helvetica', 'bold');
      // pdf.text('CyStar', margin + 8, 35);
      pdf.addImage("https://media.licdn.com/dms/image/v2/D560BAQEPEwnV8TMpSQ/company-logo_200_200/company-logo_200_200/0/1728124533458?e=2147483647&v=beta&t=fZUf-nIj-5P4SiI_cFGbaMQxqMl1AOIqZqKSegdOs6U", 'PNG', margin, 15, 40, 30);

      
      // Main title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SUBDOMAIN SECURITY REPORT', margin + 50, 25);
      
      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(203, 213, 225); // slate-300
      pdf.text('Comprehensive Security Analysis', margin + 50, 35);
      
      // // Domain name
      // pdf.setFontSize(14);
      // pdf.setFont('helvetica', 'bold');
      // pdf.setTextColor(34, 197, 94); // green-500
      // pdf.text(subdomain.domain, margin + 50, 45);

      // // Report generation date
      // pdf.setFontSize(9);
      // pdf.setTextColor(148, 163, 184); // slate-400
      // pdf.text(`             Generated on: ${new Date().toLocaleString()}`, pageWidth - margin - 80, 45);
      const domainY = 45;   // first line Y
const lineSpacing = 8; // or any spacing you like

// Domain name
pdf.setFontSize(14);
pdf.setFont('helvetica', 'bold');
pdf.setTextColor(34, 197, 94);
pdf.text(subdomain.domain, margin + 50, domainY);

// Report generation date, on next line
pdf.setFontSize(9);
pdf.setTextColor(148, 163, 184);
pdf.text(
  `Generated on: ${new Date().toLocaleString()}`,
  pageWidth - margin - 80,
  domainY + lineSpacing
);

      yPosition = 75;

      // Section divider function with enhanced styling
      const addSectionHeader = (title: string, icon?: string) => {
        checkPageBreak(30);
        
        // Section background
        pdf.setFillColor(248, 250, 252); // slate-50
        pdf.rect(margin, yPosition - 5, contentWidth, 25, 'F');
        
        // Section border
        pdf.setDrawColor(59, 130, 246); // blue-500
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition - 5, margin + contentWidth, yPosition - 5);
        
        pdf.setTextColor(15, 23, 42); // slate-900
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 8, yPosition + 8);
        
        yPosition += 30;
      };

      // Content helper function with improved styling
      const addField = (label: string, value: string, isMultiline: boolean = false, isHighlight: boolean = false) => {
        checkPageBreak(isMultiline ? 35 : 18);
        
        // if (isHighlight) {
        //   pdf.setFillColor(254, 249, 195); // yellow-100
        //   pdf.rect(margin + 2, yPosition - 3, contentWidth - 4, isMultiline ? 25 : 15, 'F');
        // }
        if (isHighlight) {
  const boxHeight = isMultiline ? 15 : 12;

  // ✅ Optional: subtle shadow
  pdf.setFillColor(200); // light gray
  pdf.roundedRect(
    margin + 4,
    yPosition - 1,
    contentWidth - 4,
    boxHeight,
    3, 3,
    'F'
  );

  // ✅ Main highlight with smaller height
  pdf.setFillColor(255, 251, 235); // soft yellow
  pdf.setDrawColor(253, 224, 71);  // border
  pdf.roundedRect(
    margin + 2,
    yPosition - 3,
    contentWidth - 4,
    boxHeight,
    3, 3,
    'FD'
  );

  // ✅ Text style inside
  pdf.setTextColor(120, 53, 15);
  pdf.setFont('helvetica', 'bold');
} else {
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
}

        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(59, 130, 246); // blue-600
        pdf.text(`${label}:`, margin + 8, yPosition);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(51, 65, 85); // slate-700
        
        if (isMultiline) {
          const textHeight = addWrappedText(value, margin + 8, yPosition + 10, contentWidth - 16, 9);
          yPosition += Math.max(textHeight + 8, 20);
        } else {
          pdf.text(value, margin + 70, yPosition);
          yPosition += 15;
        }
      };

      // Executive Summary
      addSectionHeader('Executive Summary');
      const securityStatus = subdomain.cert?.[0] ? 'SECURE' : 'ATTENTION REQUIRED';
      const statusColor = subdomain.cert?.[0] ? 'Secure Certificate Found' : 'Security Issues Detected';
      addField('Security Status', securityStatus, false, !subdomain.cert?.[0]);
      addField('Certificate Status', statusColor);
      addField('Open Ports', `${subdomain.nmap?.open_ports?.length || 0} ports discovered`);
      
      yPosition += 10;

      // Basic Information
      addSectionHeader('Domain Information');
      addField('Primary Domain', subdomain.domain);
      addField('IP Addresses', subdomain.ip.join(', '), true);
      addField('IPv4 Count', subdomain.ip.length.toString());

      yPosition += 10;

      // HTTP/HTTPS Status
      addSectionHeader('Web Service Status');
      addField('HTTP Response', `${subdomain.http[0]} - ${subdomain.http[1]}`);
      addField('HTTPS Response', `${subdomain.https[0]} - ${subdomain.https[2]}`);
      
      const httpSecure = subdomain.https[0] === 200;
      addField('Web Security', httpSecure ? 'HTTPS Available' : 'HTTPS Issues Detected', false, !httpSecure);

      yPosition += 10;

      // Network Security
      addSectionHeader('Network Security Analysis');
      const ports = subdomain.nmap?.open_ports || [];
      addField('Open Ports', ports.length > 0 ? ports.join(', ') : 'No open ports detected', true);
      addField('Port Scan Status', ports.length > 0 ? `${ports.length} ports accessible` : 'Minimal attack surface');

      yPosition += 10;

      // SSL/TLS Certificate Analysis
      addSectionHeader('SSL/TLS Certificate Analysis');
      addField('Certificate Valid', subdomain.cert?.[0] ? 'Yes' : 'No', false, !subdomain.cert?.[0]);
      addField('Expiry Date', subdomain.cert?.[1] || 'Not Available');
      
      if (subdomain.cert_details) {
        addField('Subject', subdomain.cert_details.subject_common_name || 'N/A');
        addField('Issuer', subdomain.cert_details.issuer_common_name || 'N/A');
        addField('Serial Number', subdomain.cert_details.serial_number || 'N/A', true);
        addField('Valid From', subdomain.cert_details.valid_from || 'N/A');
        addField('Valid Until', subdomain.cert_details.valid_to || 'N/A');
      }

      yPosition += 10;

      // Technology Stack Analysis
      addSectionHeader('Technology Stack Detection');
      const plugins = subdomain.whatweb?.plugins || {};
      const techStackEntries = Object.entries(plugins).map(([pluginName, pluginData]) => {
        const extractValues = (obj: any): string[] => {
          let results: string[] = [];
          for (const key in obj) {
            const val = obj[key];
            if (key === "string" && Array.isArray(val)) {
              results = results.concat(val);
            } else if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
              results.push(String(val));
            } else if (typeof val === "object" && val !== null) {
              const keys = Object.keys(val);
              const isIndexed = keys.every(k => /^\d+$/.test(k));
              if (isIndexed) {
                results = results.concat(Object.values(val).map(String));
              } else {
                results = results.concat(extractValues(val));
              }
            }
          }
          return results;
        };

        const values = extractValues(pluginData).filter(v => v !== '' && v !== null && v !== undefined);
        return values.length ? `${pluginName}: ${values.join(', ')}` : null;
      }).filter(Boolean);

      if (techStackEntries.length > 0) {
        addField('Technologies Detected', techStackEntries.length.toString());
        techStackEntries.slice(0, 10).forEach((entry, index) => {
          if (entry) addField(`Technology ${index + 1}`, entry, true);
        });
        if (techStackEntries.length > 10) {
          addField('Additional Technologies', `${techStackEntries.length - 10} more technologies detected`);
        }
      } else {
        addField('Technology Detection', 'No technologies identified');
      }

      yPosition += 10;
    // Security Alerts Analysis
addSectionHeader('Security Vulnerability Assessment (ZAP)');
const zapAlerts = subdomain.zap_alerts || [];

addField('Total Alerts', zapAlerts.length > 0 ? `${zapAlerts.length} security issues detected` : 'No vulnerabilities found');

if (zapAlerts.length > 0) {
  zapAlerts.forEach((alert, index) => {
    addField(`${alert.alert || 'Unknown Alert'}`, `${alert.risk || 'Unknown Risk'} - ${alert.url || 'No URL'}`, true);
  });
}

yPosition += 10;

      // DNS Analysis
      addSectionHeader('DNS Infrastructure Analysis');
      const aRecords = subdomain.dnsdumpster?.a_records || [];
      const mxRecords = subdomain.dnsdumpster?.mx_records || [];
      
      addField('A Records', aRecords.length > 0 ? `${aRecords.length} records found` : 'None discovered');
      if (aRecords.length > 0) {
        addField('A Record Details', aRecords.slice(0, 5).join(', '), true);
      }
      
      addField('MX Records', mxRecords.length > 0 ? `${mxRecords.length} mail servers` : 'No mail servers');
      if (mxRecords.length > 0) {
        addField('Mail Servers', mxRecords.join(', '), true);
      }

      yPosition += 10;

      // Advanced DNS Analysis
      if (subdomain.mxtoolbox) {
        addSectionHeader('Advanced DNS Analysis (MXToolbox)');
        addField('Scan Timestamp', subdomain.mxtoolbox.TimeRecorded || 'N/A');
        addField('Analysis Duration', subdomain.mxtoolbox.TimeToComplete ? `${subdomain.mxtoolbox.TimeToComplete}s` : 'N/A');
        addField('DNS Server', subdomain.mxtoolbox.ReportingNameServer || 'N/A');
        
        const info = subdomain.mxtoolbox.Information || [];
        if (info.length > 0) {
          addField('DNS Records Found', info.length.toString());
          
          info.slice(0, 5).forEach((infoItem: any, index: number) => {
            checkPageBreak(50);
            
            // Record header
            pdf.setFillColor(239, 246, 255); // blue-50
            pdf.rect(margin + 5, yPosition - 3, contentWidth - 10, 35, 'F');
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(29, 78, 216); // blue-700
            pdf.text(`DNS Record ${index + 1}`, margin + 10, yPosition + 5);
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(51, 65, 85); // slate-700
            
            pdf.text(`Type: ${infoItem.Type || 'Unknown'}`, margin + 15, yPosition + 15);
            pdf.text(`IP: ${infoItem["IP Address"] || 'N/A'}`, margin + 15, yPosition + 22);
            pdf.text(`TTL: ${infoItem.TTL || 'N/A'}`, margin + 100, yPosition + 15);
            pdf.text(`Status: ${infoItem.Status || 'N/A'}`, margin + 100, yPosition + 22);
            
            yPosition += 40;
          });
        }
      }

      // Security Recommendations
      checkPageBreak(80);
      addSectionHeader('Security Recommendations');
      
      const recommendations = [];
      if (!subdomain.cert?.[0]) {
        recommendations.push('Implement SSL/TLS certificate for secure communications');
      }
      if (subdomain.nmap?.open_ports && subdomain.nmap.open_ports.length > 5) {
        recommendations.push('Review and minimize exposed network ports');
      }
      if (subdomain.https[0] !== 200) {
        recommendations.push('Ensure HTTPS is properly configured and accessible');
      }
      
      if (recommendations.length === 0) {
        recommendations.push('Security posture appears adequate - continue monitoring');
        recommendations.push('Regular security assessments recommended');
        recommendations.push('Keep all software and certificates up to date');
      }
      
      recommendations.forEach((rec, index) => {
        addField(`Recommendation ${index + 1}`, rec, true);
      });

      // Footer with enhanced styling
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer background
        pdf.setFillColor(15, 23, 42); // slate-900
        pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
        
        // Footer content
        pdf.setTextColor(203, 213, 225); // slate-300
        pdf.setFontSize(8);
        pdf.text(`CyStar Security Report - ${subdomain.domain}`, margin, pageHeight - 12);
        pdf.text(`Confidential & Proprietary`, margin, pageHeight - 6);
        
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 25, pageHeight - 12);
        pdf.text(`${new Date().toLocaleDateString()}`, pageWidth - margin - 25, pageHeight - 6);
      }

      // Save the PDF
      pdf.save(`${subdomain.domain}_security_report.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);

      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className={`relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl
          ${isGenerating
            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white"}`}
      >
        <div className="flex items-center gap-3">
          {isGenerating ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <Shield className="w-4 h-4" />
              </div>
              <span>Download Security Report</span>
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </>
          )}
        </div>
        
        {/* Animated background effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 transition-transform duration-700 ${isGenerating ? 'translate-x-full' : '-translate-x-full group-hover:translate-x-full'}`} />
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Generate comprehensive security analysis PDF
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}