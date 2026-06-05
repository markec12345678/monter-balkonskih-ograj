'use client';

import React from 'react';
import { Project, calculatePrice, RAILING_STYLES, WPC_COLORS, WPC_PROFILES, INSTALLATION_SPECS } from '@/lib/types';
import { RAL_BALCONY_COLORS } from '@/lib/ral-colors';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface PdfGeneratorProps {
  project: Project;
}

function formatDateSlovenian(dateStr: string): string {
  const months = [
    'januar', 'februar', 'marec', 'april', 'maj', 'junij',
    'julij', 'avgust', 'september', 'oktober', 'november', 'december',
  ];
  const d = new Date(dateStr);
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function PdfGenerator({ project }: PdfGeneratorProps) {
  const generatePdf = () => {
    const doc = new jsPDF();
    const breakdown = calculatePrice(project);
    const style = RAILING_STYLES.find((s) => s.id === project.railingStyle);
    const wpcColor = WPC_COLORS.find((c) => c.id === project.wpcProfile);
    const wpcProfile = WPC_PROFILES.find((p) => p.id === project.wpcProfile);
    const ralColor = RAL_BALCONY_COLORS.find((c) => c.code === project.ralColor);
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(180, 83, 9); // amber-700
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ROKSAL WoodCore WPC', 15, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Monter Ograj PRO - Ponudba za WPC balkonsko ograjo', 15, 23);

    doc.setFontSize(9);
    doc.text(`Ponudba z dne ${formatDateSlovenian(project.createdAt)}`, 15, 30);

    // Customer info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Stranka', 15, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ime: ${project.customerName}`, 15, 53);
    doc.text(`Naslov: ${project.address}`, 15, 59);
    if (project.phone) {
      doc.text(`Telefon: ${project.phone}`, 15, 65);
    }

    // Specification table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Specifikacija WPC ograje', 15, 80);

    autoTable(doc, {
      startY: 85,
      head: [['Parameter', 'Vrednost']],
      body: [
        ['WPC Sistem', style?.name || project.railingStyle],
        ['WPC Profil', wpcProfile?.name || '/'],
        ['WPC Barva', wpcColor?.name || project.wpcColorName || '/'],
        ['Dimenzije profila', wpcProfile?.dimensions || '/'],
        ['Dolžina', `${project.lengthCm} cm`],
        ['Višina', `${project.heightCm} cm`],
        ['Širina', `${project.widthCm} cm`],
        ['Površina', `${breakdown.totalArea.toFixed(2)} m²`],
        ['Način montaže', project.mountType],
        ['RAL barva stebričkov', ralColor ? `RAL ${ralColor.code} - ${ralColor.name}` : project.ralColor],
        ['Garancija', `${INSTALLATION_SPECS.warrantyYears} let`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [180, 83, 9] },
      margin: { left: 15, right: 15 },
    });

    // Price calculation table
    const priceStartY = (doc as unknown as Record<string, number>).lastAutoTable?.finalY ?? 140;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cenena kalkulacija', 15, priceStartY + 10);

    autoTable(doc, {
      startY: priceStartY + 15,
      head: [['Postavka', 'Znesek']],
      body: [
        ['Material (WPC + ALU)', `${breakdown.baseMaterialCost.toFixed(2)} €`],
        ['Montaža', `${breakdown.mountingLabor.toFixed(2)} €`],
        ['Vmesna vsota', `${breakdown.subtotal.toFixed(2)} €`],
        ...(project.discount > 0
          ? [[`Popust (${project.discount}%)`, `-${breakdown.discountAmount.toFixed(2)} €`]]
          : []),
        ['Brez DDV', `${breakdown.afterDiscount.toFixed(2)} €`],
        [`DDV (${project.vatRate}%)`, `${breakdown.vatAmount.toFixed(2)} €`],
        ['SKUPAJ Z DDV', `${breakdown.totalWithVat.toFixed(2)} €`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [180, 83, 9] },
      margin: { left: 15, right: 15 },
      didParseCell: (data) => {
        if (data.row.index === (project.discount > 0 ? 6 : 5)) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [255, 243, 224];
        }
      },
    });

    // Notes
    if (project.notes) {
      const notesY = (doc as unknown as Record<string, number>).lastAutoTable?.finalY ?? 200;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Opombe', 15, notesY + 10);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(project.notes, pageWidth - 30);
      doc.text(lines, 15, notesY + 18);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 25;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Ponudba velja 30 dni. Popravki rezervirani.', 15, footerY);
    doc.text(`ROKSAL d.o.o. | Savska Loka 21, 4000 Kranj | ${INSTALLATION_SPECS.warrantyYears}-letna garancija`, 15, footerY + 5);
    doc.text('Monter Ograj PRO - WPC WoodCore', 15, footerY + 10);

    // Add photo if available
    if (project.photoBase64) {
      try {
        doc.addPage();
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Fotografija projekta', 15, 15);
        doc.addImage(`data:image/jpeg;base64,${project.photoBase64}`, 'JPEG', 15, 25, 180, 135);
      } catch {
        // Skip photo if it fails
      }
    }

    doc.save(`ponudba-wpc-${project.customerName?.replace(/\s+/g, '-').toLowerCase() || 'ograja'}.pdf`);
  };

  return (
    <Button
      onClick={generatePdf}
      className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
    >
      <FileDown className="w-4 h-4 mr-2" />
      Ustvari PDF ponudbo
    </Button>
  );
}
