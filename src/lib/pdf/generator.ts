import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatPercent } from '@/lib/calculations';
import type {
  Project,
  PayAppLineItemInput,
  G702Summary,
  G703Totals,
  ChangeOrder,
} from '@/lib/types';

interface GeneratePDFOptions {
  project: Project;
  applicationNumber: number;
  periodFrom: string;
  periodTo: string;
  lineItems: PayAppLineItemInput[];
  g702Summary: G702Summary;
  g703Totals: G703Totals;
  changeOrders: ChangeOrder[];
  isPro: boolean;
  companyName?: string;
  companyAddress?: string;
  companyLogoUrl?: string;
}

export async function generatePayAppPDF(options: GeneratePDFOptions): Promise<void> {
  const {
    project,
    applicationNumber,
    periodFrom,
    periodTo,
    lineItems,
    g702Summary,
    changeOrders,
    isPro,
    companyName = 'Contractor',
    companyAddress = '',
  } = options;

  // Create G702 PDF (Portrait)
  const g702 = new jsPDF('portrait', 'pt', 'letter');
  generateG702Page(g702, {
    project,
    applicationNumber,
    periodFrom,
    periodTo,
    g702Summary,
    changeOrders,
    isPro,
    companyName,
    companyAddress,
  });

  // Create G703 PDF (Landscape)
  const g703 = new jsPDF('landscape', 'pt', 'letter');
  generateG703Pages(g703, {
    project,
    applicationNumber,
    periodTo,
    lineItems,
    isPro,
  });

  // Download both PDFs
  const dateStr = new Date().toISOString().split('T')[0];
  g702.save(`G702_${project.project_name}_App${applicationNumber}_${dateStr}.pdf`);
  
  setTimeout(() => {
    g703.save(`G703_${project.project_name}_App${applicationNumber}_${dateStr}.pdf`);
  }, 500);
}

interface G702Options {
  project: Project;
  applicationNumber: number;
  periodFrom: string;
  periodTo: string;
  g702Summary: G702Summary;
  changeOrders: ChangeOrder[];
  isPro: boolean;
  companyName: string;
  companyAddress: string;
}

function generateG702Page(doc: jsPDF, options: G702Options): void {
  const {
    project,
    applicationNumber,
    periodFrom,
    periodTo,
    g702Summary,
    changeOrders,
    isPro,
    companyName,
    companyAddress,
  } = options;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('APPLICATION AND CERTIFICATE FOR PAYMENT', pageWidth / 2, y, {
    align: 'center',
  });
  y += 20;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AIA Document G702 Style', pageWidth / 2, y, { align: 'center' });
  y += 30;

  // Header info - two columns
  const col1X = margin;
  const col2X = pageWidth / 2 + 20;
  const lineHeight = 14;

  doc.setFontSize(9);

  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text('TO OWNER:', col1X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(project.owner_name, col1X + 60, y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('FROM CONTRACTOR:', col1X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(companyName, col1X + 90, y);
  y += lineHeight;

  if (companyAddress) {
    doc.text(companyAddress, col1X + 90, y);
    y += lineHeight;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('VIA ARCHITECT:', col1X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(project.architect_name || 'N/A', col1X + 70, y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('GENERAL CONTRACTOR:', col1X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(project.gc_name, col1X + 110, y);

  // Right column (reset y for alignment)
  let rightY = y - (lineHeight * 4);
  if (companyAddress) rightY -= lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT:', col2X, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(project.project_name, col2X + 50, rightY);
  rightY += lineHeight;
  doc.text(project.project_address, col2X + 50, rightY);
  rightY += lineHeight * 1.5;

  doc.setFont('helvetica', 'bold');
  doc.text('APPLICATION NO:', col2X, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(applicationNumber.toString(), col2X + 90, rightY);
  rightY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('PERIOD FROM:', col2X, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(periodFrom), col2X + 70, rightY);
  rightY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('PERIOD TO:', col2X, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(periodTo), col2X + 55, rightY);
  rightY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('CONTRACT DATE:', col2X, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(project.contract_date), col2X + 80, rightY);

  y += 40;

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Contractor's Application for Payment
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("CONTRACTOR'S APPLICATION FOR PAYMENT", margin, y);
  y += 25;

  // Summary lines
  doc.setFontSize(10);
  const valueX = pageWidth - margin - 100;
  const labelX = margin;

  const summaryLines = [
    { label: '1. Original Contract Sum', value: g702Summary.line1_original_contract_sum },
    { label: '2. Net Change by Change Orders', value: g702Summary.line2_net_change_orders },
    { label: '3. Contract Sum to Date (Line 1 + 2)', value: g702Summary.line3_contract_sum_to_date, bold: true },
    { label: '4. Total Completed & Stored to Date', value: g702Summary.line4_total_completed_and_stored },
    { label: '   (Column G on G703)', value: null, italic: true },
    { label: '5. Retainage:', value: null },
    { label: '   a. On Completed Work', value: g702Summary.line5a_retainage_on_completed, indent: true },
    { label: '   b. On Stored Materials', value: g702Summary.line5b_retainage_on_stored, indent: true },
    { label: '   Total Retainage (5a + 5b)', value: g702Summary.line5c_total_retainage },
    { label: '6. Total Earned Less Retainage (Line 4 - 5c)', value: g702Summary.line6_total_earned_less_retainage, bold: true },
    { label: '7. Less Previous Certificates for Payment', value: g702Summary.line7_less_previous_certificates },
    { label: '8. CURRENT PAYMENT DUE (Line 6 - 7)', value: g702Summary.line8_current_payment_due, bold: true, highlight: true },
    { label: '9. Balance to Finish Including Retainage', value: g702Summary.line9_balance_to_finish_plus_retainage },
  ];

  summaryLines.forEach((line) => {
    if (line.highlight) {
      doc.setFillColor(255, 248, 220);
      doc.rect(margin - 5, y - 10, pageWidth - 2 * margin + 10, 15, 'F');
    }

    doc.setFont('helvetica', line.bold ? 'bold' : 'normal');
    doc.text(line.label, labelX + (line.indent ? 20 : 0), y);

    if (line.value !== null) {
      doc.setFont('courier', line.bold ? 'bold' : 'normal');
      doc.text(formatCurrency(line.value), valueX, y, { align: 'right' });
    }

    y += lineHeight;
  });

  y += 20;

  // Change Order Summary
  if (changeOrders.length > 0) {
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CHANGE ORDER SUMMARY', margin, y);
    y += 15;

    doc.setFont('helvetica', 'normal');
    const approvedCOs = changeOrders.filter((co) => co.status === 'approved');
    doc.text(`Total Approved Change Orders: ${approvedCOs.length}`, margin, y);
    y += lineHeight;

    const netAmount = approvedCOs.reduce((sum, co) => sum + co.amount, 0);
    doc.text(`Net Amount: ${formatCurrency(netAmount)}`, margin, y);
    y += 25;
  }

  // Signature lines
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Contractor signature
  doc.text('Contractor Signature:', margin, y);
  doc.line(margin + 100, y, margin + 280, y);
  doc.text('Date:', margin + 300, y);
  doc.line(margin + 330, y, margin + 420, y);
  y += 30;

  // Notary line
  doc.text('Notary (if required):', margin, y);
  doc.line(margin + 100, y, margin + 280, y);
  y += 40;

  // Architect's Certificate
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("ARCHITECT'S CERTIFICATE FOR PAYMENT", margin, y);
  y += 15;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('(To be completed by Architect)', margin, y);
  y += 20;

  doc.text('Amount Certified: $', margin, y);
  doc.line(margin + 90, y, margin + 200, y);
  y += 20;

  doc.text('Architect Signature:', margin, y);
  doc.line(margin + 100, y, margin + 280, y);
  doc.text('Date:', margin + 300, y);
  doc.line(margin + 330, y, margin + 420, y);

  // Footer
  y = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  if (!isPro) {
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by BildPro | bildpro.io | WATERMARK - Upgrade to Pro to remove', pageWidth / 2, y, {
      align: 'center',
    });
  } else {
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by BildPro | bildpro.io', pageWidth / 2, y, {
      align: 'center',
    });
  }
}

interface G703Options {
  project: Project;
  applicationNumber: number;
  periodTo: string;
  lineItems: PayAppLineItemInput[];
  isPro: boolean;
}

function generateG703Pages(doc: jsPDF, options: G703Options): void {
  const { project, applicationNumber, periodTo, lineItems, isPro } = options;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 30;

  // Calculate how many items fit per page
  const itemsPerPage = 25;
  const totalPages = Math.ceil(lineItems.length / itemsPerPage);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      doc.addPage();
    }

    let y = margin;

    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTINUATION SHEET', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('AIA Document G703 Style', pageWidth / 2, y, { align: 'center' });
    y += 20;

    // Project info line
    doc.setFontSize(9);
    const infoY = y;
    doc.setFont('helvetica', 'bold');
    doc.text('Project:', margin, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(project.project_name, margin + 45, infoY);

    doc.setFont('helvetica', 'bold');
    doc.text('Application No:', pageWidth / 2 - 50, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(applicationNumber.toString(), pageWidth / 2 + 30, infoY);

    doc.setFont('helvetica', 'bold');
    doc.text('Period To:', pageWidth - margin - 150, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(periodTo), pageWidth - margin - 90, infoY);

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${page + 1} of ${totalPages}`, pageWidth - margin, infoY, { align: 'right' });

    y += 25;

    // Table
    const pageItems = lineItems.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    const tableData = pageItems.map((item) => {
      const totalCompleted =
        item.work_completed_previous +
        item.work_completed_this_period +
        item.materials_stored;
      const percentComplete =
        item.scheduled_value > 0 ? totalCompleted / item.scheduled_value : 0;
      const balanceToFinish = item.scheduled_value - totalCompleted;

      return [
        item.item_number,
        item.description.substring(0, 40),
        formatCurrencyShort(item.scheduled_value),
        formatCurrencyShort(item.work_completed_previous),
        formatCurrencyShort(item.work_completed_this_period),
        formatCurrencyShort(item.materials_stored),
        formatCurrencyShort(totalCompleted),
        `${(Math.min(percentComplete, 1) * 100).toFixed(1)}%`,
        formatCurrencyShort(balanceToFinish),
      ];
    });

    // Calculate totals for this page (or grand totals on last page)
    if (page === totalPages - 1) {
      const totals = lineItems.reduce(
        (acc, item) => {
          const totalCompleted =
            item.work_completed_previous +
            item.work_completed_this_period +
            item.materials_stored;
          return {
            scheduled: acc.scheduled + item.scheduled_value,
            previous: acc.previous + item.work_completed_previous,
            thisPeriod: acc.thisPeriod + item.work_completed_this_period,
            materials: acc.materials + item.materials_stored,
            total: acc.total + totalCompleted,
            balance: acc.balance + (item.scheduled_value - totalCompleted),
          };
        },
        { scheduled: 0, previous: 0, thisPeriod: 0, materials: 0, total: 0, balance: 0 }
      );

      tableData.push([
        '',
        'GRAND TOTAL',
        formatCurrencyShort(totals.scheduled),
        formatCurrencyShort(totals.previous),
        formatCurrencyShort(totals.thisPeriod),
        formatCurrencyShort(totals.materials),
        formatCurrencyShort(totals.total),
        totals.scheduled > 0
          ? `${((totals.total / totals.scheduled) * 100).toFixed(1)}%`
          : '0%',
        formatCurrencyShort(totals.balance),
      ]);
    }

    autoTable(doc, {
      startY: y,
      head: [
        [
          'A\nItem #',
          'B\nDescription of Work',
          'C\nScheduled\nValue',
          'D\nFrom Previous\nApplications',
          'E\nThis Period',
          'F\nMaterials\nStored',
          'G\nTotal to Date\n(D+E+F)',
          'H\n%',
          'I\nBalance\nto Finish',
        ],
      ],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [27, 42, 74],
        textColor: 255,
        halign: 'center',
        fontSize: 7,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 35 },
        1: { halign: 'left', cellWidth: 150 },
        2: { halign: 'right', cellWidth: 70 },
        3: { halign: 'right', cellWidth: 70 },
        4: { halign: 'right', cellWidth: 70 },
        5: { halign: 'right', cellWidth: 70 },
        6: { halign: 'right', cellWidth: 70 },
        7: { halign: 'center', cellWidth: 40 },
        8: { halign: 'right', cellWidth: 70 },
      },
      willDrawCell: (data) => {
        // Bold the last row (totals)
        if (
          page === totalPages - 1 &&
          data.row.index === tableData.length - 1
        ) {
          doc.setFont('helvetica', 'bold');
        }
      },
    });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    if (!isPro) {
      doc.setTextColor(150, 150, 150);
      doc.text(
        'Generated by BildPro | bildpro.io | WATERMARK - Upgrade to Pro to remove',
        pageWidth / 2,
        pageHeight - 20,
        { align: 'center' }
      );
    } else {
      doc.setTextColor(100, 100, 100);
      doc.text('Generated by BildPro | bildpro.io', pageWidth / 2, pageHeight - 20, {
        align: 'center',
      });
    }
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrencyShort(value: number): string {
  if (value === 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
