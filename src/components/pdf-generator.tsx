'use client';

import React, { useState } from 'react';
import { Project, calculatePrice, RAILING_STYLES, WPC_COLORS, WPC_PROFILES, INSTALLATION_SPECS } from '@/lib/types';
import { RAL_BALCONY_COLORS } from '@/lib/ral-colors';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileDown,
  FileText,
  Sparkles,
  Loader2,
  Download,
  Eye,
  Template,
} from 'lucide-react';

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

// Build input data for pdfme template
function buildPdfmeInput(project: Project) {
  const breakdown = calculatePrice(project);
  const style = RAILING_STYLES.find((s) => s.id === project.railingStyle);
  const wpcColor = WPC_COLORS.find((c) => c.id === project.wpcProfile);
  const wpcProfile = WPC_PROFILES.find((p) => p.id === project.wpcProfile);
  const ralColor = RAL_BALCONY_COLORS.find((c) => c.code === project.ralColor);
  const dateStr = formatDateSlovenian(project.createdAt);
  const offerNum = `PO-${new Date(project.createdAt).getFullYear()}-${String(new Date(project.createdAt).getMonth() + 1).padStart(2, '0')}-${String(project.id).padStart(3, '0')}`;

  return {
    offerDate: `Ponudba z dne ${dateStr}`,
    offerNumber: offerNum,
    customerInfo: `Ime: ${project.customerName}`,
    addressInfo: `Naslov: ${project.address}`,
    phoneInfo: project.phone ? `Telefon: ${project.phone}` : ' ',
    specSystem: style?.name || project.railingStyle,
    specProfile: wpcProfile?.name || '/',
    specColor: wpcColor?.name || project.wpcColorName || '/',
    specDimensions: wpcProfile?.dimensions || '/',
    specLength: `${project.lengthCm} cm`,
    specHeight: `${project.heightCm} cm`,
    specWidth: `${project.widthCm} cm`,
    specArea: `${breakdown.totalArea.toFixed(2)} m2`,
    specMount: project.mountType,
    specRAL: ralColor ? `RAL ${ralColor.code} - ${ralColor.name}` : project.ralColor,
    specWarranty: `${INSTALLATION_SPECS.warrantyYears} let`,
    priceMaterial: `${breakdown.baseMaterialCost.toFixed(2)} EUR`,
    priceMounting: `${breakdown.mountingLabor.toFixed(2)} EUR`,
    priceSubtotal: `${breakdown.subtotal.toFixed(2)} EUR`,
    priceDiscountLabel: project.discount > 0 ? `Popust (${project.discount}%)` : ' ',
    priceDiscount: project.discount > 0 ? `-${breakdown.discountAmount.toFixed(2)} EUR` : ' ',
    priceBeforeVat: `${breakdown.afterDiscount.toFixed(2)} EUR`,
    priceVatLabel: `DDV (${project.vatRate}%)`,
    priceVat: `${breakdown.vatAmount.toFixed(2)} EUR`,
    priceTotal: `${breakdown.totalWithVat.toFixed(2)} EUR`,
    notes: project.notes || ' ',
  };
}

// ROKSAL pdfme template (A4 offer)
function getRoksalTemplate() {
  const row = (y: number, label: string, field: string, isAlt: boolean) => [
    {
      type: 'text' as const,
      position: { x: 12, y },
      width: 80,
      height: 6,
      content: label,
      readOnly: true,
      style: { fontSize: 9, fontColor: '#374151', ...(isAlt ? { backgroundColor: '#fef3c7' } : {}) },
    },
    {
      type: 'text' as const,
      position: { x: 92, y },
      width: 106,
      height: 6,
      content: '',
      field,
      style: { fontSize: 9, fontColor: '#1a1a1a', alignment: 'right' as const, ...(isAlt ? { backgroundColor: '#fef3c7' } : {}) },
    },
  ];

  const priceRow = (y: number, label: string, field: string, isAlt: boolean, opts?: { bold?: boolean; color?: string; bg?: string }) => [
    {
      type: 'text' as const,
      position: { x: 12, y },
      width: 110,
      height: opts?.bold ? 8 : 6,
      content: label,
      readOnly: true,
      style: {
        fontSize: opts?.bold ? 11 : 9,
        fontColor: opts?.color || '#374151',
        bold: opts?.bold,
        ...(opts?.bg || isAlt ? { backgroundColor: opts?.bg || '#fef3c7' } : {}),
      },
    },
    {
      type: 'text' as const,
      position: { x: 122, y },
      width: 76,
      height: opts?.bold ? 8 : 6,
      content: '',
      field,
      style: {
        fontSize: opts?.bold ? 11 : 9,
        fontColor: opts?.color || '#1a1a1a',
        bold: opts?.bold,
        alignment: 'right' as const,
        ...(opts?.bg || isAlt ? { backgroundColor: opts?.bg || '#fef3c7' } : {}),
      },
    },
  ];

  return {
    basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] as [number, number, number, number] },
    schemas: [
      [
        // Header bar background
        { type: 'text', position: { x: 0, y: 0 }, width: 210, height: 40, readOnly: true, content: ' ', style: { backgroundColor: '#b45309' } },
        // Company name
        { type: 'text', position: { x: 12, y: 8 }, width: 100, height: 12, readOnly: true, content: 'ROKSAL WoodCore WPC', style: { fontSize: 22, fontColor: '#ffffff', backgroundColor: '#b45309', bold: true } },
        // Subtitle
        { type: 'text', position: { x: 12, y: 22 }, width: 140, height: 8, readOnly: true, content: 'Monter Ograj PRO - Ponudba za WPC balkonsko ograjo', style: { fontSize: 10, fontColor: '#fde68a', backgroundColor: '#b45309' } },
        // Date
        { type: 'text', position: { x: 12, y: 30 }, width: 80, height: 6, content: '', field: 'offerDate', style: { fontSize: 9, fontColor: '#fde68a', backgroundColor: '#b45309' } },
        // Offer number
        { type: 'text', position: { x: 140, y: 8 }, width: 58, height: 8, content: '', field: 'offerNumber', style: { fontSize: 11, fontColor: '#ffffff', backgroundColor: '#b45309', alignment: 'right', bold: true } },

        // Customer section
        { type: 'text', position: { x: 12, y: 48 }, width: 80, height: 8, readOnly: true, content: 'Podatki stranke', style: { fontSize: 13, fontColor: '#b45309', bold: true } },
        { type: 'text', position: { x: 12, y: 58 }, width: 90, height: 6, content: '', field: 'customerInfo', style: { fontSize: 10, fontColor: '#1a1a1a' } },
        { type: 'text', position: { x: 12, y: 65 }, width: 90, height: 6, content: '', field: 'addressInfo', style: { fontSize: 10, fontColor: '#1a1a1a' } },
        { type: 'text', position: { x: 12, y: 72 }, width: 90, height: 6, content: '', field: 'phoneInfo', style: { fontSize: 10, fontColor: '#1a1a1a' } },

        // Specification section
        { type: 'text', position: { x: 12, y: 86 }, width: 100, height: 8, readOnly: true, content: 'Specifikacija WPC ograje', style: { fontSize: 13, fontColor: '#b45309', bold: true } },
        // Table header
        { type: 'text', position: { x: 12, y: 96 }, width: 80, height: 7, readOnly: true, content: 'Parameter', style: { fontSize: 9, fontColor: '#ffffff', backgroundColor: '#b45309', bold: true, alignment: 'center' } },
        { type: 'text', position: { x: 92, y: 96 }, width: 106, height: 7, readOnly: true, content: 'Vrednost', style: { fontSize: 9, fontColor: '#ffffff', backgroundColor: '#b45309', bold: true, alignment: 'center' } },

        // Spec rows
        ...row(103, 'WPC Sistem', 'specSystem', true),
        ...row(109, 'WPC Profil', 'specProfile', false),
        ...row(115, 'WPC Barva', 'specColor', true),
        ...row(121, 'Dimenzije profila', 'specDimensions', false),
        ...row(127, 'Dolzina', 'specLength', true),
        ...row(133, 'Visina', 'specHeight', false),
        ...row(139, 'Sirina', 'specWidth', true),
        ...row(145, 'Povrsina', 'specArea', false),
        ...row(151, 'Nacin montaze', 'specMount', true),
        ...row(157, 'RAL barva stebričkov', 'specRAL', false),
        ...row(163, 'Garancija', 'specWarranty', true),

        // Price section
        { type: 'text', position: { x: 12, y: 178 }, width: 100, height: 8, readOnly: true, content: 'Cenena kalkulacija', style: { fontSize: 13, fontColor: '#b45309', bold: true } },
        // Price table header
        { type: 'text', position: { x: 12, y: 188 }, width: 110, height: 7, readOnly: true, content: 'Postavka', style: { fontSize: 9, fontColor: '#ffffff', backgroundColor: '#b45309', bold: true, alignment: 'center' } },
        { type: 'text', position: { x: 122, y: 188 }, width: 76, height: 7, readOnly: true, content: 'Znesek', style: { fontSize: 9, fontColor: '#ffffff', backgroundColor: '#b45309', bold: true, alignment: 'center' } },

        // Price rows
        ...priceRow(195, 'Material (WPC + ALU)', 'priceMaterial', true),
        ...priceRow(201, 'Montaza', 'priceMounting', false),
        ...priceRow(207, 'Vmesna vsota', 'priceSubtotal', true),
        ...priceRow(213, '', 'priceDiscountLabel', false, { color: '#dc2626' }),
        ...priceRow(213, '', 'priceDiscount', false, { color: '#dc2626' }),
        ...priceRow(219, 'Brez DDV', 'priceBeforeVat', true),
        ...priceRow(225, '', 'priceVatLabel', false),
        ...priceRow(225, '', 'priceVat', false),
        ...priceRow(232, 'SKUPAJ Z DDV', 'priceTotal', false, { bold: true, color: '#b45309', bg: '#fff7ed' }),

        // Notes
        { type: 'text', position: { x: 12, y: 248 }, width: 80, height: 7, readOnly: true, content: 'Opombe', style: { fontSize: 11, fontColor: '#b45309', bold: true } },
        { type: 'text', position: { x: 12, y: 256 }, width: 186, height: 18, content: '', field: 'notes', style: { fontSize: 9, fontColor: '#374151' } },

        // Footer
        { type: 'text', position: { x: 12, y: 278 }, width: 186, height: 5, readOnly: true, content: 'Ponudba velja 30 dni. Popravki rezervirani.', style: { fontSize: 7, fontColor: '#9ca3af' } },
        { type: 'text', position: { x: 12, y: 283 }, width: 186, height: 5, readOnly: true, content: 'ROKSAL d.o.o. | Savska Loka 21, 4000 Kranj | 15-letna garancija', style: { fontSize: 7, fontColor: '#9ca3af' } },
        { type: 'text', position: { x: 12, y: 288 }, width: 186, height: 5, readOnly: true, content: 'Monter Ograj PRO - WPC WoodCore', style: { fontSize: 7, fontColor: '#9ca3af' } },
      ],
    ],
  };
}

export function PdfGenerator({ project }: PdfGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState<'pdfme' | 'jspdf'>('pdfme');

  const generateWithPdfme = async () => {
    setGenerating(true);
    try {
      const { generate } = await import('@pdfme/generator');
      const template = getRoksalTemplate();
      const input = buildPdfmeInput(project);

      const pdfBytes = await generate({
        template,
        inputs: [input],
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ponudba-wpc-${project.customerName?.replace(/\s+/g, '-').toLowerCase() || 'ograja'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('pdfme generation failed, falling back to jsPDF:', err);
      generateWithJsPdf();
    } finally {
      setGenerating(false);
    }
  };

  const generateWithJsPdf = () => {
    // jsPDF fallback
    const { jsPDF } = require('jspdf');
    const autoTable = require('jspdf-autotable').default;
    const doc = new jsPDF();
    const breakdown = calculatePrice(project);
    const style = RAILING_STYLES.find((s) => s.id === project.railingStyle);
    const wpcColor = WPC_COLORS.find((c) => c.id === project.wpcProfile);
    const wpcProfile = WPC_PROFILES.find((p) => p.id === project.wpcProfile);
    const ralColor = RAL_BALCONY_COLORS.find((c) => c.code === project.ralColor);
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(180, 83, 9);
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

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Stranka', 15, 45);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ime: ${project.customerName}`, 15, 53);
    doc.text(`Naslov: ${project.address}`, 15, 59);
    if (project.phone) doc.text(`Telefon: ${project.phone}`, 15, 65);

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
        ...(project.discount > 0 ? [[`Popust (${project.discount}%)`, `-${breakdown.discountAmount.toFixed(2)} €`]] : []),
        ['Brez DDV', `${breakdown.afterDiscount.toFixed(2)} €`],
        [`DDV (${project.vatRate}%)`, `${breakdown.vatAmount.toFixed(2)} €`],
        ['SKUPAJ Z DDV', `${breakdown.totalWithVat.toFixed(2)} €`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [180, 83, 9] },
      margin: { left: 15, right: 15 },
    });

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

    const footerY = doc.internal.pageSize.getHeight() - 25;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Ponudba valja 30 dni. Popravki rezervirani.', 15, footerY);
    doc.text(`ROKSAL d.o.o. | Savska Loka 21, 4000 Kranj | ${INSTALLATION_SPECS.warrantyYears}-letna garancija`, 15, footerY + 5);
    doc.text('Monter Ograj PRO - WPC WoodCore', 15, footerY + 10);

    if (project.photoBase64) {
      try {
        doc.addPage();
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Fotografija projekta', 15, 15);
        doc.addImage(`data:image/jpeg;base64,${project.photoBase64}`, 'JPEG', 15, 25, 180, 135);
      } catch { /* skip photo */ }
    }

    doc.save(`ponudba-wpc-${project.customerName?.replace(/\s+/g, '-').toLowerCase() || 'ograja'}.pdf`);
  };

  const handleGenerate = () => {
    if (mode === 'pdfme') {
      generateWithPdfme();
    } else {
      generateWithJsPdf();
    }
  };

  return (
    <div className="space-y-4">
      {/* Engine selector */}
      <div className="flex items-center gap-3">
        <Label className="text-xs text-muted-foreground">PDF motor:</Label>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('pdfme')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              mode === 'pdfme'
                ? 'bg-amber-600 text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            pdfme
          </button>
          <button
            onClick={() => setMode('jspdf')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              mode === 'jspdf'
                ? 'bg-amber-600 text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <FileText className="w-3 h-3" />
            jsPDF
          </button>
        </div>
        {mode === 'pdfme' && (
          <Badge variant="outline" className="text-[8px] border-amber-500/30 text-amber-400">
            <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Template engine
          </Badge>
        )}
      </div>

      {/* Info card */}
      {mode === 'pdfme' && (
        <Card className="border-amber-500/20 bg-amber-950/10">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Template className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-200/80 space-y-1">
                <p><strong>pdfme</strong> uporablja predlogo (template) za generiranje PDF-ja. Predlogo je mogoče vizualno urejati s pdfme Designer orodjem.</p>
                <p className="text-muted-foreground">Predloga: ROKSAL A4 Ponudba (template-based, profesionalen izgled)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generiram PDF...
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4 mr-2" />
            Ustvari PDF ponudbo ({mode === 'pdfme' ? 'pdfme' : 'jsPDF'})
          </>
        )}
      </Button>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={className}>{children}</label>;
}
