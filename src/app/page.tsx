'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, DEFAULT_PROJECT } from '@/lib/types';
import {
  getAllProjects,
  createProject,
  updateProject,
} from '@/lib/idb-storage';
import { ProjectList } from '@/components/project-list';
import { ProjectDetail } from '@/components/project-detail';
import { RoksalCatalog } from '@/components/roksal-catalog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const loadProjects = useCallback(async () => {
    const all = await getAllProjects();
    setProjects(all);
  }, []);

  useEffect(() => {
    let mounted = true;
    getAllProjects().then((all) => {
      if (mounted) setProjects(all);
    });
    return () => { mounted = false; };
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedId) || null;

  const totalMeters = useMemo(() =>
    projects.reduce((sum, p) => {
      const m = ((p.lengthCm + 2 * p.widthCm) / 100) * 1.1;
      return sum + m;
    }, 0),
  [projects]);

  const activeCount = useMemo(() =>
    projects.filter((p) => p.status === 'active').length,
  [projects]);

  async function handleAdd(data: {
    customerName: string;
    address: string;
    phone: string;
  }) {
    const newProject = {
      ...DEFAULT_PROJECT,
      ...data,
    };
    const created = await createProject(newProject);
    await loadProjects();
    setSelectedId(created.id);
    setShowDetail(true);
  }

  async function handleUpdate(updated: Project) {
    await updateProject(updated);
    await loadProjects();
  }

  function handleSelect(id: number) {
    setSelectedId(id);
    setShowDetail(true);
  }

  function handleBack() {
    setShowDetail(false);
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Monter Ograj PRO</h1>
            <p className="text-[10px] text-muted-foreground">Terenski tablični sistem</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
          ROKSAL
        </Badge>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCatalogOpen(true)}
            className="h-8 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-600/10"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Katalog
          </Button>
        </div>
      </header>

      {/* Main content: master-detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Project list - sidebar on desktop */}
        <div
          className={`w-full lg:w-[35%] lg:min-w-[320px] lg:max-w-[420px] border-r border-white/5 bg-card/30 ${
            showDetail ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
          }`}
        >
          <ProjectList
            projects={projects}
            selectedId={selectedId}
            onSelect={handleSelect}
            onAdd={handleAdd}
            totalMeters={totalMeters}
            activeCount={activeCount}
          />
        </div>

        {/* Detail workspace */}
        <div
          className={`flex-1 ${
            showDetail ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          {selectedProject ? (
            <ProjectDetail
              key={selectedProject.id}
              project={selectedProject}
              onUpdate={handleUpdate}
              onBack={handleBack}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏗️</span>
                </div>
                <p className="text-sm font-medium">Izberite projekt</p>
                <p className="text-xs mt-1">ali ustvarite novega z gumbom &quot;Nov projekt&quot;</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ROKSAL Catalog Modal */}
      <RoksalCatalog open={catalogOpen} onOpenChange={setCatalogOpen} />
    </div>
  );
}
