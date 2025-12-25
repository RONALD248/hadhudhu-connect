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
