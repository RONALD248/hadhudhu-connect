import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MemberData {
  first_name: string;
  last_name: string;
  phone?: string | null;
  gender?: string | null;
  membership_number?: string | null;
  baptism_date?: string | null;
  is_active?: boolean;
}

interface PaymentData {
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number?: string | null;
  category?: { name: string } | null;
}

interface DashboardStat {
  title: string;
  value: string;
  description?: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
}

interface DashboardReportOptions {
  churchName?: string;
  reportTitle: string;
  reportDate?: Date;
  stats?: DashboardStat[];
  contributionTrend?: ChartDataPoint[];
  attendanceTrend?: ChartDataPoint[];
  categoryBreakdown?: ChartDataPoint[];
  recentPayments?: PaymentData[];
  additionalNotes?: string;
}

export function exportMembersToPDF(members: MemberData[], churchName = 'Hadhudhu SDA Church') {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(churchName, 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Member Registry', 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 38, { align: 'center' });
  
  // Table data
  const tableData = members.map((m, index) => [
    (index + 1).toString(),
    `${m.first_name} ${m.last_name}`,
    m.membership_number || '-',
    m.phone || '-',
    m.gender || '-',
    m.baptism_date ? 'Baptized' : 'Visitor',
    m.is_active ? 'Active' : 'Inactive',
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['#', 'Name', 'Member No.', 'Phone', 'Gender', 'Status', 'Active']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`members-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportPaymentsToPDF(
  payments: PaymentData[],
  title = 'Contribution Report',
  churchName = 'Hadhudhu SDA Church'
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(churchName, 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 38, { align: 'center' });

  // Calculate total
  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  
  // Table data
  const tableData = payments.map((p, index) => [
    (index + 1).toString(),
    new Date(p.payment_date).toLocaleDateString(),
    p.category?.name || '-',
    `KES ${Number(p.amount).toLocaleString()}`,
    p.payment_method,
    p.reference_number || '-',
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['#', 'Date', 'Category', 'Amount', 'Method', 'Reference']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    foot: [['', '', '', `Total: KES ${total.toLocaleString()}`, '', '']],
    footStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`contributions-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportDashboardReport(options: DashboardReportOptions) {
  const {
    churchName = 'Hadhudhu SDA Church',
    reportTitle,
    reportDate = new Date(),
    stats = [],
    contributionTrend = [],
    attendanceTrend = [],
    categoryBreakdown = [],
    recentPayments = [],
    additionalNotes,
  } = options;

  const doc = new jsPDF();
  let currentY = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(churchName, 105, currentY, { align: 'center' });
  currentY += 12;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(reportTitle, 105, currentY, { align: 'center' });
  currentY += 8;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${reportDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 105, currentY, { align: 'center' });
  doc.setTextColor(0);
  currentY += 15;

  // Divider line
  doc.setDrawColor(200);
  doc.line(20, currentY, 190, currentY);
  currentY += 10;

  // Key Statistics Section
  if (stats.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Statistics', 20, currentY);
    currentY += 8;

    // Create stats in a grid-like format
    const statsPerRow = 2;
    const statWidth = 80;
    
    for (let i = 0; i < stats.length; i += statsPerRow) {
      const rowStats = stats.slice(i, i + statsPerRow);
      rowStats.forEach((stat, index) => {
        const xPos = 20 + (index * statWidth);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(stat.title, xPos, currentY);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(stat.value, xPos, currentY + 6);
        
        if (stat.description) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(120);
          doc.text(stat.description, xPos, currentY + 12);
        }
      });
      currentY += 22;
    }
    doc.setTextColor(0);
    currentY += 5;
  }

  // Contribution Trend Section
  if (contributionTrend.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Contribution Trends', 20, currentY);
    currentY += 8;

    autoTable(doc, {
      startY: currentY,
      head: [['Period', 'Amount (KES)']],
      body: contributionTrend.map(item => [
        item.label,
        `KES ${item.value.toLocaleString()}`
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        1: { halign: 'right' }
      },
      margin: { left: 20, right: 20 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  // Attendance Trend Section
  if (attendanceTrend.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Attendance Patterns', 20, currentY);
    currentY += 8;

    autoTable(doc, {
      startY: currentY,
      head: [['Period', 'Attendance']],
      body: attendanceTrend.map(item => [
        item.label,
        item.value.toString()
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        1: { halign: 'right' }
      },
      margin: { left: 20, right: 20 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  // Category Breakdown Section
  if (categoryBreakdown.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Category Breakdown', 20, currentY);
    currentY += 8;

    const total = categoryBreakdown.reduce((sum, item) => sum + item.value, 0);

    autoTable(doc, {
      startY: currentY,
      head: [['Category', 'Amount (KES)', 'Percentage']],
      body: categoryBreakdown.map(item => [
        item.label,
        `KES ${item.value.toLocaleString()}`,
        total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '0%'
      ]),
      foot: [['Total', `KES ${total.toLocaleString()}`, '100%']],
      theme: 'striped',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      footStyles: {
        fillColor: [139, 92, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      },
      margin: { left: 20, right: 20 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  // Recent Payments Section
  if (recentPayments.length > 0) {
    if (currentY > 180) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Contributions', 20, currentY);
    currentY += 8;

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Category', 'Amount', 'Method']],
      body: recentPayments.slice(0, 10).map(p => [
        new Date(p.payment_date).toLocaleDateString(),
        p.category?.name || '-',
        `KES ${Number(p.amount).toLocaleString()}`,
        p.payment_method
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 20, right: 20 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  // Additional Notes
  if (additionalNotes) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', 20, currentY);
    currentY += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(additionalNotes, 170);
    doc.text(splitNotes, 20, currentY);
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `${churchName} | ${reportTitle} | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  const filename = reportTitle.toLowerCase().replace(/\s+/g, '-');
  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
}
