'use client';

import React, { useState } from 'react';
import { Project } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Plus,
  MapPin,
  Ruler,
  Phone,
} from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: (data: { customerName: string; address: string; phone: string }) => void;
  totalMeters: number;
  activeCount: number;
}

export function ProjectList({
  projects,
  selectedId,
  onSelect,
  onAdd,
  totalMeters,
  activeCount,
}: ProjectListProps) {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filtered = projects.filter(
    (p) =>
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    if (!newName.trim()) return;
    onAdd({ customerName: newName.trim(), address: newAddress.trim(), phone: newPhone.trim() });
    setNewName('');
    setNewAddress('');
    setNewPhone('');
    setAddOpen(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stats */}
      <div className="flex gap-2 p-3 border-b border-white/5">
        <Badge variant="secondary" className="text-xs gap-1">
          <Ruler className="w-3 h-3" />
          {totalMeters.toFixed(1)} m
        </Badge>
        <Badge variant="secondary" className="text-xs gap-1">
          {activeCount} aktivnih
        </Badge>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Išči po imenu ali naslovu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Project list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {search ? 'Ni zadetkov' : 'Ni projektov'}
            </div>
          ) : (
            filtered.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelect(project.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-muted/50 ${
                  selectedId === project.id
                    ? 'bg-amber-600/20 border border-amber-500/30'
                    : 'border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm truncate flex-1">
                    {project.customerName}
                  </h4>
                  <Badge
                    variant={project.status === 'active' ? 'default' : 'secondary'}
                    className={`text-[10px] ml-2 ${
                      project.status === 'active'
                        ? 'bg-amber-600 text-white'
                        : 'bg-green-600/20 text-green-400'
                    }`}
                  >
                    {project.status === 'active' ? 'Aktivno' : 'Zaključeno'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{project.address || 'Brez naslova'}</span>
                </div>
                {project.phone && (
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{project.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                  <span>{project.lengthCm}×{project.heightCm} cm</span>
                  <span>•</span>
                  <span>{project.railingStyle.replace(/_/g, ' ')}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add button */}
      <div className="p-3 border-t border-white/5">
        <Button
          onClick={() => setAddOpen(true)}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nov projekt
        </Button>
      </div>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nov projekt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Ime stranke *</label>
              <Input
                placeholder="npr. Novak Janez"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Naslov</label>
              <Input
                placeholder="npr. Slovenska 15, Ljubljana"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Telefon</label>
              <Input
                placeholder="npr. 031 234 567"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              Ustvari projekt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
