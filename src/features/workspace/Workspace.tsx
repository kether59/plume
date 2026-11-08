"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { ResearchTab } from "@/components/ResearchTab";
import { StructureTab } from "@/components/StructureTab";
import { CharactersTab } from "@/components/CharactersTab";
import { DraftingStudioTab } from "@/components/DraftingStudioTab";
import { TimelineTab } from "@/components/TimelineTab";
import { RevisionTab } from "@/components/RevisionTab";
import { BetaReadingTab } from "@/components/BetaReadingTab";
import { BeginnerCompassModal } from "@/components/BeginnerCompassModal";
import { ArchitectureVisionModal } from "@/components/ArchitectureVisionModal";
import { AiSettingsModal } from "@/components/AiSettingsModal";
import { Feather, Compass, Layers, Sparkles, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppLocale } from "@/components/AppLocaleProvider";

export default function Home() {
  const { locale } = useAppLocale();
  const router = useRouter();
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [characterRelations, setCharacterRelations] = useState<any[]>([]);
  const [worldNotes, setWorldNotes] = useState<any[]>([]);
  const [writingSessions, setWritingSessions] = useState<any[]>([]);
  const [betaFeedbacks, setBetaFeedbacks] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [currentStage, setCurrentStage] = useState<string>("draft");
  const [activeChapterId, setActiveChapterId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Modals state
  const [isCompassOpen, setIsCompassOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);

  // Load project details
  const loadProject = useCallback(async (projId: number) => {
    try {
      const res = await fetch(`/api/projects/${projId}`);
      if (!res.ok) throw new Error("Failed to load project");
      const data = await res.json();
      setCurrentProject(data.project);
      setChapters(data.chapters || []);
      setCharacters(data.characters || []);
      setCharacterRelations(data.characterRelations || []);
      setWorldNotes(data.worldNotes || []);
      setWritingSessions(data.writingSessions || []);
      setBetaFeedbacks(data.betaFeedbacks || []);
      setTimelineEvents(data.timelineEvents || []);
      if (data.project.currentStage) {
        setCurrentStage(data.project.currentStage);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Initial load
  const loadAllProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || `Impossible de charger les projets (${res.status}).`);
      }
      const data = await res.json();
      setProjectsList(data);
      setLoadError("");
      if (data.length > 0) {
        await loadProject(data[0].id);
      }
    } catch (e) {
      console.error(e);
      setLoadError(e instanceof Error ? e.message : "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }, [loadProject]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadAllProjects();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadAllProjects]);

  const handleSelectProject = (id: number) => {
    loadProject(id);
  };

  const handleCreateProject = async (newProjData: any) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProjData),
      });
      if (res.ok) {
        const created = await res.json();
        setProjectsList((prev) => [created, ...prev]);
        await loadProject(created.id);
        setCurrentStage(created.currentStage || (created.workflowOrder === "write_first" ? "draft" : "research"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeWorkflow = async (workflowOrder: string) => {
    if (!currentProject || !["prepare_first", "write_first"].includes(workflowOrder)) return;
    try {
      const res = await fetch(`/api/projects/${currentProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowOrder }),
      });
      if (!res.ok) throw new Error("Impossible d’enregistrer l’ordre du parcours.");
      setCurrentProject((project: any) => ({ ...project, workflowOrder }));
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Impossible d’enregistrer l’ordre du parcours.");
    }
  };

  const handleSelectStage = async (stage: string) => {
    setCurrentStage(stage);
    if (currentProject) {
      try {
        await fetch(`/api/projects/${currentProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentStage: stage }),
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleOpenDraftChapter = (chapterId: number) => {
    setActiveChapterId(chapterId);
    setCurrentStage("draft");
  };

  const handleRecordSession = async (wordsWritten: number, durationMinutes: number) => {
    if (!currentProject) return;
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject.id,
          wordsWritten,
          durationMinutes,
          mood: "inspired",
          antiSelfCensorshipUsed: true,
        }),
      });
      if (currentProject.id) {
        loadProject(currentProject.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compute today's written words from sessions
  const today = new Date().toISOString().split("T")[0];
  const todayWords = writingSessions
    .filter((s) => s.sessionDate && new Date(s.sessionDate).toISOString().split("T")[0] === today)
    .reduce((acc, s) => acc + (s.wordsWritten || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
            <Feather className="w-8 h-8 animate-bounce" />
          </div>
          <span className="font-serif text-amber-200 text-sm">
            {locale === "en" ? "Opening your writing studio..." : "Ouverture de votre atelier d'écriture..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        currentProject={currentProject}
        allProjects={projectsList}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        workflowOrder={currentProject?.workflowOrder || "prepare_first"}
        onChangeWorkflow={handleChangeWorkflow}
        currentStage={currentStage}
        onSelectStage={handleSelectStage}
        onOpenCompass={() => setIsCompassOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        todayWords={todayWords}
        onLogout={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.replace("/login");
        }}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {loadError ? (
          <section className="mx-auto mt-12 max-w-2xl rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-950 shadow-sm">
            <h1 className="font-serif text-xl font-semibold">{locale === "en" ? "The studio could not load your projects" : "L’atelier n’a pas pu ouvrir vos projets"}</h1>
            <p className="mt-2 text-sm">{loadError}</p>
            <p className="mt-3 text-sm">{locale === "en" ? "Check your database configuration and try again." : "Vérifiez la configuration de la base de données, puis réessayez."}</p>
            <button
              onClick={loadAllProjects}
              className="mt-5 rounded-lg bg-rose-900 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
            >
              {locale === "en" ? "Try again" : "Réessayer"}
            </button>
          </section>
        ) : currentProject ? (
          <div>
            <div hidden={currentStage !== "draft"}>
              <DraftingStudioTab
                key={currentProject.id}
                projectId={currentProject.id}
                project={currentProject}
                chapters={chapters}
                characters={characters}
                worldNotes={worldNotes}
                activeChapterId={activeChapterId}
                onRefresh={() => loadProject(currentProject.id)}
                onRecordSession={handleRecordSession}
              />
            </div>

            {currentStage === "research" && (
              <ResearchTab
                projectId={currentProject.id}
                worldNotes={worldNotes}
                onRefresh={() => loadProject(currentProject.id)}
                project={currentProject}
              />
            )}

            {currentStage === "structure" && (
              <StructureTab
                projectId={currentProject.id}
                project={currentProject}
                chapters={chapters}
                onRefresh={() => loadProject(currentProject.id)}
                onOpenDraftChapter={handleOpenDraftChapter}
              />
            )}

            {currentStage === "characters" && (
              <CharactersTab
                projectId={currentProject.id}
                characters={characters}
                relations={characterRelations}
                onRefresh={() => loadProject(currentProject.id)}
                project={currentProject}
              />
            )}

            {currentStage === "timeline" && (
              <TimelineTab
                projectId={currentProject.id}
                events={timelineEvents}
                chapters={chapters}
                characters={characters}
                worldNotes={worldNotes}
                onRefresh={() => loadProject(currentProject.id)}
              />
            )}

            {currentStage === "revision" && (
              <RevisionTab
                projectId={currentProject.id}
                project={currentProject}
                chapters={chapters}
                characters={characters}
                onRefresh={() => loadProject(currentProject.id)}
              />
            )}

            {currentStage === "beta" && (
              <BetaReadingTab
                projectId={currentProject.id}
                project={currentProject}
                chapters={chapters}
                characters={characters}
                worldNotes={worldNotes}
                betaFeedbacks={betaFeedbacks}
                onRefresh={() => loadProject(currentProject.id)}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400">{locale === "en" ? "No project selected." : "Aucun projet sélectionné."}</p>
          </div>
        )}
      </main>

      {/* Footer with supportive quotation */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {locale === "en"
              ? "Plume & First Draft — A supportive writing studio for aspiring novelists"
              : "Plume & Premier Jet — L’Atelier d’Écriture Bienveillant pour Romanciers en Devenir"}
          </span>
          <span className="italic text-slate-400">
            {locale === "en" ? "“Write with your heart, revise with your mind.”" : "« Écrivez avec le cœur, réécrivez avec la tête. »"}
          </span>
        </div>
      </footer>

      {/* Modals */}
      <BeginnerCompassModal
        isOpen={isCompassOpen}
        onClose={() => setIsCompassOpen(false)}
      />

      <ArchitectureVisionModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
      />
    </div>
  );
}
