export type RailingStyle =
  | 'MODERN_ALU'
  | 'GLASS_PANEL'
  | 'STAINLESS_STEEL_CABLE'
  | 'ELEGANT_WOODEN'
  | 'WROUGHT_IRON';

export type MountType = 'V tla (Zgoraj)' | 'Bočno (V fasado)';

export type DrawingMode = 'VIEW' | 'MEASURE' | 'RAILING';

export type ProjectStatus = 'active' | 'finished';

export interface RALColor {
  code: string;
  name: string;
  hexColor: string;
  category: string;
}

export interface RailingStyleInfo {
  id: RailingStyle;
  name: string;
  description: string;
  pricePerMeter: number;
  material: 'Inox' | 'Steklo' | 'Alu' | 'Kovina';
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
  color: string;
  width: number;
  mode: DrawingMode;
  label?: string;
}

export interface CalibrationData {
  pixelLength: number;
  realLengthCm: number;
  pixelsPerCm: number;
}

export interface Project {
  id: number;
  customerName: string;
  address: string;
  phone: string;
  lengthCm: number;
  heightCm: number;
  widthCm: number;
  mountType: MountType;
  railingStyle: RailingStyle;
  ralColor: string;
  ralColorName: string;
  notes: string;
  status: ProjectStatus;
  discount: number;
  vatRate: number; // 9.5 or 22
  photoBase64?: string;
  annotatedPhotoBase64?: string;
  strokes: DrawingStroke[];
  calibrationData?: CalibrationData;
  aiReport?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceBreakdown {
  totalMeters: number;
  heightMultiplier: number;
  baseMaterialCost: number;
  mountingLabor: number;
  subtotal: number;
  discountAmount: number;
  afterDiscount: number;
  vatAmount: number;
  totalWithVat: number;
}

export const RAILING_STYLES: RailingStyleInfo[] = [
  {
    id: 'MODERN_ALU',
    name: 'ROKSAL H-Line (Vodoravne letve)',
    description: 'Sodoben ALU sistem z vodoravnimi letvami',
    pricePerMeter: 190,
    material: 'Alu',
  },
  {
    id: 'GLASS_PANEL',
    name: 'ROKSAL Steklena (Glass)',
    description: 'Premium sistem brez vidnih profilov',
    pricePerMeter: 320,
    material: 'Steklo',
  },
  {
    id: 'STAINLESS_STEEL_CABLE',
    name: 'ROKSAL V-Line (Pokončne letve)',
    description: 'Varnostni sistem s pokončnimi letvami',
    pricePerMeter: 210,
    material: 'Inox',
  },
  {
    id: 'ELEGANT_WOODEN',
    name: 'ROKSAL Panelna (CNC Laserski izrez)',
    description: 'CNC lasersko izrezani vzorci',
    pricePerMeter: 225,
    material: 'Alu',
  },
  {
    id: 'WROUGHT_IRON',
    name: 'ROKSAL Klasik (Tradicionalna)',
    description: 'Klasična kovana ograja z ornamenti',
    pricePerMeter: 240,
    material: 'Kovina',
  },
];

export const DEFAULT_PROJECT: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  customerName: '',
  address: '',
  phone: '',
  lengthCm: 0,
  heightCm: 110,
  widthCm: 0,
  mountType: 'V tla (Zgoraj)',
  railingStyle: 'MODERN_ALU',
  ralColor: '7016',
  ralColorName: 'Antracit siva',
  notes: '',
  status: 'active',
  discount: 0,
  vatRate: 9.5,
  photoBase64: undefined,
  annotatedPhotoBase64: undefined,
  strokes: [],
  calibrationData: undefined,
  aiReport: undefined,
};

export function calculatePrice(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): PriceBreakdown {
  const style = RAILING_STYLES.find((s) => s.id === project.railingStyle);
  const pricePerMeter = style?.pricePerMeter ?? 190;

  const totalMeters = ((project.lengthCm + 2 * project.widthCm) / 100) * 1.1;
  const heightMultiplier =
    project.heightCm > 100 ? 1.0 + (project.heightCm - 100) * 0.012 : 1.0;

  const baseMaterialCost = totalMeters * pricePerMeter * heightMultiplier;
  const mountingLabor = project.mountType === 'Bočno (V fasado)' ? 140 : 50;
  const subtotal = baseMaterialCost + mountingLabor;
  const discountAmount = subtotal * (project.discount / 100);
  const afterDiscount = subtotal - discountAmount;
  const vatAmount = afterDiscount * (project.vatRate / 100);
  const totalWithVat = afterDiscount + vatAmount;

  return {
    totalMeters,
    heightMultiplier,
    baseMaterialCost,
    mountingLabor,
    subtotal,
    discountAmount,
    afterDiscount,
    vatAmount,
    totalWithVat,
  };
}
