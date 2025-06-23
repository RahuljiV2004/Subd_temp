import React, { useState } from 'react';
import { Download, FileText, Shield, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import type { SubdomainSubfinder } from '../types/subdomain';

interface PDFDownloadButtonProps {
  subdomain: SubdomainSubfinder;
}

export default function SubfinderPDFDownloadButton({ subdomain }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

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
      
      // Add CyStar logo placeholder (you can replace with actual logo)
      pdf.setFillColor(59, 130, 246); // blue-500
      pdf.roundedRect(margin, 15, 40, 30, 5, 5, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CyStar', margin + 8, 35);
      
      // Main title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SUBFINDER SECURITY REPORT', margin + 50, 25);
      
      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(203, 213, 225); // slate-300
      pdf.text('Comprehensive Subdomain Analysis', margin + 50, 35);
      
      // Domain name and timestamp
      const domainY = 45;
      const lineSpacing = 8;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 197, 94);
      pdf.text(subdomain.subdomain, margin + 50, domainY);

      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        `Generated on: ${new Date().toLocaleString()}`,
        pageWidth - margin - 80,
        domainY + lineSpacing
      );

      yPosition = 75;

      // Section divider function with enhanced styling
      const addSectionHeader = (title: string) => {
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
        
        if (isHighlight) {
          const boxHeight = isMultiline ? 15 : 12;
          
          // Subtle shadow
          pdf.setFillColor(200);
          pdf.roundedRect(margin + 4, yPosition - 1, contentWidth - 4, boxHeight, 3, 3, 'F');
          
          // Main highlight
          pdf.setFillColor(255, 251, 235);
          pdf.setDrawColor(253, 224, 71);
          pdf.roundedRect(margin + 2, yPosition - 3, contentWidth - 4, boxHeight, 3, 3, 'FD');
          
          pdf.setTextColor(120, 53, 15);
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(59, 130, 246);
        pdf.text(`${label}:`, margin + 8, yPosition);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(51, 65, 85);
        
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
      const hasHttps = subdomain.httpx_status_code >= 200 && subdomain.httpx_status_code < 400;
      const hasTls = subdomain.httpx_tls_host ? true : false;
      const securityStatus = hasTls ? 'SECURE' : 'ATTENTION REQUIRED';
      
      addField('Security Status', securityStatus, false, !hasTls);
      addField('HTTP Status', subdomain.httpx_status_code ? subdomain.httpx_status_code.toString() : 'Unknown');
      addField('TLS Available', hasTls ? 'Yes' : 'No', false, !hasTls);
      
      yPosition += 10;

      // Basic Information
      addSectionHeader('Domain Information');
      addField('Subdomain', subdomain.subdomain);
      addField('IP Addresses', subdomain.httpx_a?.join(', ') || 'Not Available', true);
      addField('IPv4 Count', (subdomain.httpx_a?.length || 0).toString());
      addField('Page Title', subdomain.httpx_title || 'Not Available', true);

      yPosition += 10;

      // HTTP/HTTPS Status
      addSectionHeader('Web Service Status');
      addField('HTTP Status Code', subdomain.httpx_status_code?.toString() || 'Unknown');
      addField('Web Server', subdomain.httpx_webserver || 'Not Detected');
      
      const httpSecure = subdomain.httpx_status_code >= 200 && subdomain.httpx_status_code < 400;
      addField('Web Accessibility', httpSecure ? 'Accessible' : 'Issues Detected', false, !httpSecure);

      yPosition += 10;

      // TLS Certificate Analysis
      addSectionHeader('TLS Certificate Analysis');
      addField('TLS Host', subdomain.httpx_tls_host || 'Not Available');
      addField('TLS Port', subdomain.httpx_tls_port?.toString() || 'Not Available');
      addField('TLS Version', subdomain.httpx_tls_tls_version || 'Not Available');
      addField('Cipher Suite', subdomain.httpx_tls_cipher || 'Not Available', true);
      
      if (subdomain.httpx_tls_subject_cn) {
        addField('Subject CN', subdomain.httpx_tls_subject_cn);
      }
      
      if (subdomain.httpx_tls_issuer_cn) {
        addField('Issuer CN', subdomain.httpx_tls_issuer_cn);
      }
      
      if (subdomain.httpx_tls_issuer_org?.length > 0) {
        addField('Issuer Organization', subdomain.httpx_tls_issuer_org.join(', '), true);
      }
      
      if (subdomain.httpx_tls_not_before) {
        addField('Valid From', subdomain.httpx_tls_not_before);
      }
      
      if (subdomain.httpx_tls_not_after) {
        addField('Valid Until', subdomain.httpx_tls_not_after);
      }
      
      addField('Wildcard Certificate', 
        String(subdomain.httpx_tls_wildcard_certificate) === 'true' ? 'Yes' : 'No'
      );

      yPosition += 10;

      // Subject Alternative Names
      if (subdomain.httpx_tls_subject_an?.length > 0) {
        addSectionHeader('Subject Alternative Names');
        addField('Alt Names Count', subdomain.httpx_tls_subject_an.length.toString());
        addField('Alt Names', subdomain.httpx_tls_subject_an.join(', '), true);
        
        yPosition += 10;
      }

      // Technology Stack Analysis
      addSectionHeader('Technology Stack Detection');
      if (subdomain.httpx_tech?.length > 0) {
        addField('Technologies Count', subdomain.httpx_tech.length.toString());
        subdomain.httpx_tech.forEach((tech, index) => {
          addField(`Technology ${index + 1}`, tech);
        });
      } else {
        addField('Technology Detection', 'No technologies identified');
      }

      yPosition += 10;

      // DNS Analysis
      addSectionHeader('DNS Infrastructure Analysis');
      addField('DNS Host', subdomain.dnsx_host || 'Not Available');
      addField('DNS Status Code', subdomain.dnsx_status_code?.toString() || 'Not Available');
      addField('DNS TTL', subdomain.dnsx_ttl?.toString() || 'Not Available');
      
      if (subdomain.dnsx_resolver?.length > 0) {
        addField('DNS Resolvers', subdomain.dnsx_resolver.join(', '), true);
      }
      
      if (subdomain.dnsx_a?.length > 0) {
        addField('DNS A Records', subdomain.dnsx_a.join(', '), true);
      }
      
      if (subdomain.dnsx_all?.length > 0) {
        addField('Raw DNS Records', subdomain.dnsx_all.slice(0, 5).join(', '), true);
        if (subdomain.dnsx_all.length > 5) {
          addField('Additional DNS Records', `${subdomain.dnsx_all.length - 5} more records available`);
        }
      }

      yPosition += 10;

      // DNS Response Details
      if (subdomain.dnsx_raw_resp) {
        addSectionHeader('DNS Response Details');
        addField('Query ID', subdomain.dnsx_raw_resp.Id?.toString() || 'N/A');
        addField('Response Code', subdomain.dnsx_raw_resp.Rcode?.toString() || 'N/A');
        addField('Opcode', subdomain.dnsx_raw_resp.Opcode?.toString() || 'N/A');
        addField('Authoritative', subdomain.dnsx_raw_resp.Authoritative ? 'Yes' : 'No');
        addField('Recursion Available', subdomain.dnsx_raw_resp.RecursionAvailable ? 'Yes' : 'No');
        
        if (subdomain.dnsx_raw_resp.Answer?.length > 0) {
          addField('Answer Records', subdomain.dnsx_raw_resp.Answer.length.toString());
          subdomain.dnsx_raw_resp.Answer.slice(0, 3).forEach((answer, index) => {
            const answerText = `Name: ${answer.Hdr?.Name || 'N/A'}, Type: ${answer.Hdr?.Rrtype || 'N/A'}, TTL: ${answer.Hdr?.Ttl || 'N/A'}, IP: ${answer.A || 'N/A'}`;
            addField(`Answer ${index + 1}`, answerText, true);
          });
        }
        
        yPosition += 10;
      }

      // Certificate Fingerprints
      if (subdomain.httpx_tls_fingerprint_hash) {
        addSectionHeader('Certificate Fingerprints');
        if (subdomain.httpx_tls_fingerprint_hash.md5) {
          addField('MD5 Hash', subdomain.httpx_tls_fingerprint_hash.md5, true);
        }
        if (subdomain.httpx_tls_fingerprint_hash.sha1) {
          addField('SHA1 Hash', subdomain.httpx_tls_fingerprint_hash.sha1, true);
        }
        if (subdomain.httpx_tls_fingerprint_hash.sha256) {
          addField('SHA256 Hash', subdomain.httpx_tls_fingerprint_hash.sha256, true);
        }
        
        yPosition += 10;
      }

      // Security Recommendations
      checkPageBreak(80);
      addSectionHeader('Security Recommendations');
      
      const recommendations = [];
      
      if (!subdomain.httpx_tls_host) {
        recommendations.push('Implement TLS/SSL certificate for secure communications');
      }
      
      if (subdomain.httpx_status_code && (subdomain.httpx_status_code < 200 || subdomain.httpx_status_code >= 400)) {
        recommendations.push('Review HTTP response status - service may be inaccessible');
      }
      
      if (!subdomain.httpx_tls_tls_version) {
        recommendations.push('Ensure TLS is properly configured for encrypted communications');
      }
      
      if (subdomain.httpx_tls_tls_version && subdomain.httpx_tls_tls_version.includes('1.0')) {
        recommendations.push('Upgrade TLS version - TLS 1.0 is deprecated and insecure');
      }
      
      if (subdomain.httpx_tls_not_after) {
        const expiryDate = new Date(subdomain.httpx_tls_not_after);
        const now = new Date();
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 30) {
          recommendations.push(`Certificate expires in ${daysUntilExpiry} days - renewal required soon`);
        }
      }
      
      if (recommendations.length === 0) {
        recommendations.push('Security posture appears adequate - continue monitoring');
        recommendations.push('Regular security assessments recommended');
        recommendations.push('Keep all software and certificates up to date');
        recommendations.push('Monitor for DNS changes and certificate renewals');
      }
      
      recommendations.forEach((rec, index) => {
        addField(`Recommendation ${index + 1}`, rec, true);
      });

      // Timestamp Information
      yPosition += 10;
      addSectionHeader('Scan Information');
      if (subdomain.dnsx_timestamp) {
        addField('DNS Scan Timestamp', subdomain.dnsx_timestamp);
      }
      addField('Report Generated', new Date().toLocaleString());
      addField('Scan Method', 'Subfinder + HTTPX + DNSX');

      // Footer with enhanced styling
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer background
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
        
        // Footer content
        pdf.setTextColor(203, 213, 225);
        pdf.setFontSize(8);
        pdf.text(`CyStar Subfinder Report - ${subdomain.subdomain}`, margin, pageHeight - 12);
        pdf.text(`Confidential & Proprietary`, margin, pageHeight - 6);
        
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 25, pageHeight - 12);
        pdf.text(`${new Date().toLocaleDateString()}`, pageWidth - margin - 25, pageHeight - 6);
      }

      // Save the PDF
      pdf.save(`${subdomain.subdomain}_subfinder_report.pdf`);
      
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
              <span>Download Subfinder Report</span>
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </>
          )}
        </div>
        
        {/* Animated background effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 transition-transform duration-700 ${isGenerating ? 'translate-x-full' : '-translate-x-full group-hover:translate-x-full'}`} />
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Generate comprehensive subfinder analysis PDF
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}