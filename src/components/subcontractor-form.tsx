'use client';

import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { SubcontractorData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  UserPlus,
  Building2,
  Phone,
  Mail,
  MapPin,
  Wrench,
  Send,
  CheckCircle2,
  PenLine,
} from 'lucide-react';

interface SubcontractorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SPECIALIZATIONS = [
  'WPC Montaža',
  'ALU Konstrukcije',
  'Steklena polnila',
  'Elektro instalacije',
  'Zidarstvo',
  'Tesarska dela',
  'Fasaderska dela',
  'Krovstvo',
];

const EMPTY_FORM: SubcontractorData = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postCode: '',
  experience: '',
  specializations: [],
  references: '',
  notes: '',
};

export function SubcontractorForm({ open, onOpenChange }: SubcontractorFormProps) {
  const [form, setForm] = useState<SubcontractorData>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const sigRef = useRef<SignatureCanvas>(null);

  function updateField<K extends keyof SubcontractorData>(key: K, value: SubcontractorData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSpec(spec: string) {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  }

  function handleSubmit() {
    // Pripravi email za ROKSAL
    const sigData = sigRef.current ? sigRef.current.toDataURL() : '';
    const subject = encodeURIComponent('Prijava podizvajalca - Monter Ograj PRO');
    const body = encodeURIComponent(
      `PODATAKI PODIZVAJALCA\n` +
      `========================\n` +
      `Podjetje: ${form.companyName}\n` +
      `Oseba za stik: ${form.contactPerson}\n` +
      `Email: ${form.email}\n` +
      `Telefon: ${form.phone}\n` +
      `Naslov: ${form.address}, ${form.postCode} ${form.city}\n\n` +
      `IZKUŠNJE\n` +
      `========\n` +
      `${form.experience}\n\n` +
      `SPECIALIZACIJE\n` +
      `==============\n` +
      `${form.specializations.join(', ')}\n\n` +
      `REFERENCE\n` +
      `=========\n` +
      `${form.references}\n\n` +
      `OPOMBE\n` +
      `======\n` +
      `${form.notes}\n\n` +
      `Podpisano digitalno preko Monter Ograj PRO`
    );

    // Odpre email klienta z mailto
    window.open(`mailto:info@roksal.com?subject=${subject}&body=${body}`, '_self');
    setSubmitted(true);
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setSubmitted(false);
    if (sigRef.current) sigRef.current.clear();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-500" />
            Prijavi se kot podizvajalec
            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
              ROKSAL išče podizvajalce
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-400" />
            <h3 className="text-lg font-semibold">Prijava poslana!</h3>
            <p className="text-sm text-muted-foreground">
              Vaša prijava je bila poslana na <strong>info@roksal.com</strong>.
              ROKSAL se bo oglasil v najkrajšem možnem času.
            </p>
            <Button onClick={handleReset} variant="outline" className="mt-4">
              Pošlji novo prijavo
            </Button>
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            {/* Info banner */}
            <div className="bg-amber-600/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-300">
                ROKSAL d.o.o. aktivno išče podizvajalce za montažo WPC WoodCore balkonskih ograj.
                Izpolnite obrazec in pošljite prijavo direktno na info@roksal.com.
              </p>
            </div>

            {/* Podatki podjetja */}
            <Card className="border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  Podatki podjetja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Ime podjetja *</Label>
                    <Input
                      value={form.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      className="h-9 mt-1"
                      placeholder="Podjetje d.o.o."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Oseba za stik *</Label>
                    <Input
                      value={form.contactPerson}
                      onChange={(e) => updateField('contactPerson', e.target.value)}
                      className="h-9 mt-1"
                      placeholder="Ime in priimek"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email *
                    </Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="h-9 mt-1"
                      placeholder="info@podjetje.si"
                    />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Telefon *
                    </Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="h-9 mt-1"
                      placeholder="031 234 567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Naslov */}
            <Card className="border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  Naslov
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <Label className="text-xs">Ulica in hišna št.</Label>
                    <Input
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className="h-9 mt-1"
                      placeholder="Savska Loka 21"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Poštna št.</Label>
                    <Input
                      value={form.postCode}
                      onChange={(e) => updateField('postCode', e.target.value)}
                      className="h-9 mt-1"
                      placeholder="4000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Kraj</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="h-9 mt-1"
                      placeholder="Kranj"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Izkušnje in specializacije */}
            <Card className="border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  Izkušnje in specializacije
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Opis izkušenj *</Label>
                  <Textarea
                    value={form.experience}
                    onChange={(e) => updateField('experience', e.target.value)}
                    className="mt-1 min-h-[80px]"
                    placeholder="Leta izkušenj, vrste projektov, velikost ekipe..."
                  />
                </div>
                <div>
                  <Label className="text-xs">Specializacije</Label>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {SPECIALIZATIONS.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => toggleSpec(spec)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          form.specializations.includes(spec)
                            ? 'bg-amber-600 text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Reference</Label>
                  <Textarea
                    value={form.references}
                    onChange={(e) => updateField('references', e.target.value)}
                    className="mt-1 min-h-[60px]"
                    placeholder="Pretekli projekti, stranke, reference..."
                  />
                </div>
                <div>
                  <Label className="text-xs">Dodatne opombe</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    className="mt-1 min-h-[60px]"
                    placeholder="Dodatne informacije, razpoložljivost..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Podpis */}
            <Card className="border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-amber-500" />
                  Digitalni podpis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="border border-white/10 rounded-lg bg-white/5 overflow-hidden">
                  <SignatureCanvas
                    ref={sigRef}
                    canvasProps={{
                      className: 'w-full',
                      style: { width: '100%', height: '120px' },
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sigRef.current?.clear()}
                    className="h-7 text-xs"
                  >
                    Počisti podpis
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={!form.companyName || !form.contactPerson || !form.email || !form.phone}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Pošlji prijavo na info@roksal.com
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Podatki bodo poslani na info@roksal.com preko vašega email klienta
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
