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
