import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateAuditPDF(scan, allFindings, aiSummary) {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  
  // Custom font/style config
  doc.setFont("helvetica");
  
  // Top Header
  doc.setFillColor(9, 13, 22);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("KODIVA WEBSITE ANALIZ RAPORU", 14, 20);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Taranan Site: ${scan.normalizedUrl}`, 14, 28);
  doc.text(`Tarih: ${new Date(scan.createdAt).toLocaleDateString('tr-TR')}`, 14, 34);

  // Overall Score Section
  let yPos = 55;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("1. GENEL DEGERLENDIRME", 14, yPos);
  
  yPos += 15;
  doc.setFontSize(36);
  const score = scan.overallScore || 0;
  if (score >= 80) doc.setTextColor(34, 197, 94); // Green
  else if (score >= 50) doc.setTextColor(245, 158, 11); // Yellow
  else doc.setTextColor(239, 68, 68); // Red
  
  doc.text(`${score}/100`, 14, yPos);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(12);
  doc.text(`Kritik Hata: ${scan.summary?.criticalCount || 0}  |  Uyari: ${scan.summary?.warningCount || 0}  |  Basarili: ${scan.summary?.goodCount || 0}`, 80, yPos - 5);

  // AI Summary
  if (aiSummary) {
    yPos += 20;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Yapay Zeka Ozeti:", 14, yPos);
    
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const splitAi = doc.splitTextToSize(aiSummary, 180);
    doc.text(splitAi, 14, yPos);
    yPos += (splitAi.length * 6) + 10;
  } else {
    yPos += 20;
  }

  // Priority Findings
  const priorityFindings = allFindings.filter(f => f.status === 'critical' || f.status === 'warning').slice(0, 5);
  
  if (priorityFindings.length > 0) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("2. ONCELIKLI AKSİYON PLANI", 14, yPos);
    
    const tableData = priorityFindings.map(f => [
      f.status.toUpperCase(),
      f.categoryLabel || f.categoryKey,
      f.title,
      f.advice || f.description
    ]);

    doc.autoTable({
      startY: yPos + 8,
      head: [['Durum', 'Kategori', 'Bulgu', 'Tavsiye']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9, font: "helvetica" },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 45 },
        3: { cellWidth: 75 }
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 0) {
          if (data.cell.raw === 'CRITICAL') data.cell.styles.textColor = [239, 68, 68];
          if (data.cell.raw === 'WARNING') data.cell.styles.textColor = [245, 158, 11];
        }
      }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
  }

  // All Categories Detailed
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("3. DETAYLI KATEGORI BULGULARI", 14, yPos);

  const detailedData = allFindings.map(f => [
    f.categoryLabel || f.categoryKey,
    f.status.toUpperCase(),
    f.title,
    f.description
  ]);

  doc.autoTable({
    startY: yPos + 8,
    head: [['Kategori', 'Durum', 'Bulgu', 'Aciklama']],
    body: detailedData,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 9, font: "helvetica" },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 45 },
      3: { cellWidth: 75 }
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 1) {
        if (data.cell.raw === 'CRITICAL') data.cell.styles.textColor = [239, 68, 68];
        if (data.cell.raw === 'WARNING') data.cell.styles.textColor = [245, 158, 11];
        if (data.cell.raw === 'GOOD') data.cell.styles.textColor = [34, 197, 94];
      }
    }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`KODIVA Web Sistemleri - Sayfa ${i} / ${pageCount}`, 14, pageHeight - 10);
    doc.text(`Rapor URL: https://kodiva.com/analiz/${scan.id}`, 120, pageHeight - 10);
  }

  doc.save(`Kodiva_Analiz_${scan.normalizedUrl.replace(/\./g, '_')}.pdf`);
}
