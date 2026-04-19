import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReceiptData {
  receiptNumber: string;
  memberName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string | null;
  categoryName: string;
  categoryCode: string;
  description: string | null;
  treasurerName: string;
  secretaryName: string;
  treasurerConfirmedAt: string | null;
  secretaryConfirmedAt: string | null;
}

export function generateReceiptPDF(data: ReceiptData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const centerX = pageWidth / 2;
  let y = 15;

  // === HEADER BAND ===
  doc.setFillColor(0, 68, 124); // Adventist blue
  doc.rect(0, 0, pageWidth, 52, 'F');

  // Gold accent line
  doc.setFillColor(198, 146, 20);
  doc.rect(0, 52, pageWidth, 4, 'F');

  // Church name
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('HADHUDHU SDA CHURCH', centerX, y + 8, { align: 'center' });

  // Subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(198, 146, 20);
  doc.text('Seventh-day Adventist Church', centerX, y + 17, { align: 'center' });

  // Receipt title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL PAYMENT RECEIPT', centerX, y + 30, { align: 'center' });

  y = 64;

  // === RECEIPT NUMBER & DATE ===
  doc.setTextColor(0, 68, 124);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt No: ${data.receiptNumber}`, 20, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Date Issued: ${generatedDate}`, pageWidth - 20, y, { align: 'right' });
  y += 12;

  // Divider
  doc.setDrawColor(198, 146, 20);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // === RECIPIENT ===
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Received from:', 20, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 68, 124);
  doc.text(data.memberName, 20, y + 8);
  y += 22;

  // === PAYMENT DETAILS TABLE ===
  const formattedAmount = `KES ${data.amount.toLocaleString('en-KE')}`;
  const formattedDate = new Date(data.paymentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedMethod = data.paymentMethod
    .replace('_', ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

  const tableBody: string[][] = [
    ['Payment Category', `${data.categoryName}${data.categoryCode ? ` (${data.categoryCode})` : ''}`],
    ['Amount Paid', formattedAmount],
    ['Payment Date', formattedDate],
    ['Payment Method', formattedMethod],
    ['Reference Number', data.referenceNumber || 'N/A'],
  ];

  if (data.description) {
    tableBody.push(['Description', data.description]);
  }

  autoTable(doc, {
    startY: y,
    body: tableBody,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: { top: 6, bottom: 6, left: 12, right: 12 },
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 100, 100], cellWidth: 55 },
      1: { textColor: [30, 30, 30] },
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: 20, right: 20 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  // === AMOUNT HIGHLIGHT BOX ===
  doc.setFillColor(240, 247, 240);
  doc.setDrawColor(26, 124, 62);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, y, pageWidth - 40, 28, 4, 4, 'FD');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(26, 124, 62);
  doc.text('Total Amount Received:', 30, y + 12);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedAmount, pageWidth - 30, y + 12, { align: 'right' });

  y += 40;

  // === VERIFICATION SECTION ===
  doc.setFillColor(245, 247, 255);
  doc.setDrawColor(0, 68, 124);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, y, pageWidth - 40, 42, 4, 4, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 68, 124);
  doc.text('Payment Verified By:', 30, y + 10);

  // Treasurer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Church Treasurer', 30, y + 20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(data.treasurerName, 30, y + 27);

  if (data.treasurerConfirmedAt) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(new Date(data.treasurerConfirmedAt).toLocaleDateString(), 30, y + 34);
  }

  // Secretary
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Church Secretary', centerX + 10, y + 20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(data.secretaryName, centerX + 10, y + 27);

  if (data.secretaryConfirmedAt) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(new Date(data.secretaryConfirmedAt).toLocaleDateString(), centerX + 10, y + 34);
  }

  y += 52;

  // === BIBLE VERSE ===
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  const verse = '"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7';
  const splitVerse = doc.splitTextToSize(verse, pageWidth - 40);
  doc.text(splitVerse, centerX, y, { align: 'center' });

  // === FOOTER ===
  doc.setFillColor(0, 68, 124);
  doc.rect(0, doc.internal.pageSize.height - 22, pageWidth, 22, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(198, 146, 20);
  doc.text('Hadhudhu Seventh-day Adventist Church', centerX, doc.internal.pageSize.height - 13, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(170, 184, 204);
  doc.text('This is an official computer-generated receipt. Keep for your records.', centerX, doc.internal.pageSize.height - 7, { align: 'center' });

  return doc;
}

export function downloadReceiptPDF(data: ReceiptData) {
  const doc = generateReceiptPDF(data);
  doc.save(`receipt-${data.receiptNumber}.pdf`);
}

interface CombinedReceiptsData {
  memberName: string;
  receipts: ReceiptData[];
}

export function downloadAllReceiptsPDF({ memberName, receipts }: CombinedReceiptsData) {
  if (receipts.length === 0) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const centerX = pageWidth / 2;

  // === COVER PAGE ===
  doc.setFillColor(0, 68, 124);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(198, 146, 20);
  doc.rect(0, 90, pageWidth, 4, 'F');
  doc.rect(0, 150, pageWidth, 4, 'F');

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('HADHUDHU SDA CHURCH', centerX, 70, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(198, 146, 20);
  doc.text('Seventh-day Adventist Church', centerX, 82, { align: 'center' });

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CONSOLIDATED RECEIPTS REPORT', centerX, 120, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 230, 245);
  doc.text(`Prepared for: ${memberName}`, centerX, 175, { align: 'center' });

  const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);
  doc.setFontSize(11);
  doc.text(`${receipts.length} verified receipt${receipts.length === 1 ? '' : 's'}`, centerX, 188, { align: 'center' });
  doc.text(`Total: KES ${totalAmount.toLocaleString('en-KE')}`, centerX, 198, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(170, 184, 204);
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    centerX,
    pageHeight - 30,
    { align: 'center' }
  );

  // === SUMMARY PAGE ===
  doc.addPage();
  let y = 20;

  doc.setFillColor(0, 68, 124);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Summary of Payments', centerX, 20, { align: 'center' });

  y = 45;
  autoTable(doc, {
    startY: y,
    head: [['#', 'Receipt No.', 'Date', 'Category', 'Method', 'Amount (KES)']],
    body: receipts.map((r, i) => [
      String(i + 1),
      r.receiptNumber,
      new Date(r.paymentDate).toLocaleDateString('en-GB'),
      r.categoryName,
      r.paymentMethod.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      r.amount.toLocaleString('en-KE'),
    ]),
    foot: [['', '', '', '', 'TOTAL', totalAmount.toLocaleString('en-KE')]],
    theme: 'striped',
    headStyles: { fillColor: [0, 68, 124], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [240, 247, 240], textColor: [26, 124, 62], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    margin: { left: 15, right: 15 },
  });

  // === INDIVIDUAL RECEIPTS ===
  receipts.forEach((receipt, idx) => {
    doc.addPage();

    // Reuse the single-receipt layout (mini-version inline to avoid jsPDF instance copy)
    const r = receipt;
    let yy = 15;

    doc.setFillColor(0, 68, 124);
    doc.rect(0, 0, pageWidth, 52, 'F');
    doc.setFillColor(198, 146, 20);
    doc.rect(0, 52, pageWidth, 4, 'F');

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('HADHUDHU SDA CHURCH', centerX, yy + 8, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(198, 146, 20);
    doc.text('Seventh-day Adventist Church', centerX, yy + 17, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`RECEIPT ${idx + 1} OF ${receipts.length}`, centerX, yy + 30, { align: 'center' });

    yy = 64;

    doc.setTextColor(0, 68, 124);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Receipt No: ${r.receiptNumber}`, 20, yy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      new Date(r.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      pageWidth - 20,
      yy,
      { align: 'right' }
    );
    yy += 10;

    doc.setDrawColor(198, 146, 20);
    doc.line(20, yy, pageWidth - 20, yy);
    yy += 8;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Received from:', 20, yy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 68, 124);
    doc.text(r.memberName, 20, yy + 7);
    yy += 18;

    const formattedAmount = `KES ${r.amount.toLocaleString('en-KE')}`;
    const tableBody: string[][] = [
      ['Payment Category', `${r.categoryName}${r.categoryCode ? ` (${r.categoryCode})` : ''}`],
      ['Amount Paid', formattedAmount],
      ['Payment Method', r.paymentMethod.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())],
      ['Reference Number', r.referenceNumber || 'N/A'],
    ];
    if (r.description) tableBody.push(['Description', r.description]);

    autoTable(doc, {
      startY: yy,
      body: tableBody,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: { top: 5, bottom: 5, left: 12, right: 12 } },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [100, 100, 100], cellWidth: 55 },
        1: { textColor: [30, 30, 30] },
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 20, right: 20 },
    });

    yy = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    doc.setFillColor(240, 247, 240);
    doc.setDrawColor(26, 124, 62);
    doc.roundedRect(20, yy, pageWidth - 40, 24, 4, 4, 'FD');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 124, 62);
    doc.text('Total Amount:', 30, yy + 14);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(formattedAmount, pageWidth - 30, yy + 14, { align: 'right' });
    yy += 32;

    doc.setFillColor(245, 247, 255);
    doc.setDrawColor(0, 68, 124);
    doc.roundedRect(20, yy, pageWidth - 40, 36, 4, 4, 'FD');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 68, 124);
    doc.text('Verified By:', 30, yy + 9);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Treasurer', 30, yy + 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(r.treasurerName, 30, yy + 25);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Secretary', centerX + 10, yy + 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(r.secretaryName, centerX + 10, yy + 25);

    // Footer
    doc.setFillColor(0, 68, 124);
    doc.rect(0, pageHeight - 16, pageWidth, 16, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(170, 184, 204);
    doc.text(
      `Hadhudhu SDA Church  •  Page ${idx + 3} of ${receipts.length + 2}`,
      centerX,
      pageHeight - 6,
      { align: 'center' }
    );
  });

  const safeName = memberName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`all-receipts-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`);
}
