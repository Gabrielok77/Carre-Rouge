import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, Clock, Trash2, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MeetingReport } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ReportsPage: React.FC = () => {
  const { meetings, currentUser } = useApp();
  const [reports, setReports] = useState<MeetingReport[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [standaloneMeetingDate, setStandaloneMeetingDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const selectedMeeting = meetings.find((meeting) => meeting.id === selectedMeetingId);

  // Chargement initial des PV depuis la base de données
  useEffect(() => {
    const fetchReports = async () => {
      if (!isSupabaseConfigured) return;
      const { data, error } = await supabase.from('reports').select('*').order('uploaded_at', { ascending: false });
      
      if (data && !error) {
        setReports(data.map((r: any) => ({
          id: r.id,
          title: r.title,
          meetingDate: r.meeting_date,
          uploadedAt: r.uploaded_at,
          expiresAt: r.expires_at,
          pdfUrl: r.pdf_url,
          fileName: r.file_name,
          fileSizeMb: r.file_size_mb,
          authorName: r.author_name,
        })));
      }
    };
    void fetchReports();
  }, []);

  const handleMeetingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const meetingId = event.target.value;
    setSelectedMeetingId(meetingId);
    const meeting = meetings.find((item) => item.id === meetingId);
    if (meeting) setStandaloneMeetingDate(meeting.date.slice(0, 10));
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isSupabaseConfigured) return;

    const meetingDate = selectedMeeting?.date.slice(0, 10) || standaloneMeetingDate;
    if (!meetingDate) {
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    const uploadedAt = new Date();
    const expiresAt = new Date(uploadedAt);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

    try {
      // 1. Upload du fichier physique dans le bucket "reports_pdfs"
      const { error: uploadError } = await supabase.storage
        .from('reports_pdfs')
        .upload(safeFileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // 2. Récupération de l'URL publique
      const { data: urlData } = supabase.storage
        .from('reports_pdfs')
        .getPublicUrl(safeFileName);

      const newReport = {
        id: `report-${Date.now()}`,
        title: file.name.replace(/\.pdf$/i, ''),
        meeting_date: meetingDate,
        uploaded_at: uploadedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        pdf_url: urlData.publicUrl,
        file_name: safeFileName, // Stocké pour faciliter la suppression ultérieure
        file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
        author_name: currentUser,
      };

      // 3. Sauvegarde des métadonnées en base
      const { error: dbError } = await supabase.from('reports').insert([newReport]);
      if (dbError) throw dbError;

      // 4. Mise à jour de l'état local
      setReports((prev) => [{
        id: newReport.id,
        title: newReport.title,
        meetingDate: newReport.meeting_date,
        uploadedAt: newReport.uploaded_at,
        expiresAt: newReport.expires_at,
        pdfUrl: newReport.pdf_url,
        fileName: newReport.file_name,
        fileSizeMb: newReport.file_size_mb,
        authorName: newReport.author_name,
      }, ...prev]);

    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
      alert("L'envoi du document a échoué.");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (report: MeetingReport) => {
    if (!window.confirm(`Supprimer le PV « ${report.title} » ?`) || !isSupabaseConfigured) return;

    try {
      // 1. Suppression du fichier physique
      if (report.fileName) {
        await supabase.storage.from('reports_pdfs').remove([report.fileName]);
      }
      
      // 2. Suppression de l'entrée en base de données
      await supabase.from('reports').delete().eq('id', report.id);
      
      // 3. Mise à jour de l'interface
      setReports((prev) => prev.filter((item) => item.id !== report.id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const getDaysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-amber-600" />
            PV des Discussions
          </h1>
          <p className="text-sm text-stone-600">
            Les comptes-rendus officiels restent archivés et consultables pendant au moins 20 jours.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Associer le PV à une réunion
            </label>
            <select
              value={selectedMeetingId}
              onChange={handleMeetingChange}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              disabled={isUploading}
            >
              <option value="">Aucune réunion sélectionnée</option>
              {meetings.map((meeting) => (
                <option key={meeting.id} value={meeting.id}>
                  {formatDateDDMMYYYY(meeting.date)} - {meeting.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Date du PV {selectedMeeting ? '(reprise de la réunion)' : '*'}
            </label>
            <input
              type="date"
              value={selectedMeeting ? selectedMeeting.date.slice(0, 10) : standaloneMeetingDate}
              onChange={(event) => setStandaloneMeetingDate(event.target.value)}
              disabled={Boolean(selectedMeeting) || isUploading}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
            />
          </div>
        </div>

        <label className={`w-full cursor-pointer px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? 'Envoi en cours...' : 'Ajouter le PDF du PV'}
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
        <p className="text-[11px] text-stone-500">
          Sélectionnez une réunion ou renseignez une date avant de choisir le PDF.
        </p>
      </div>

      <div className="grid gap-4">
        {reports.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-10 text-center">
            <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-700">Aucun PV ajouté</p>
            <p className="text-xs text-stone-500 mt-1">
              Ajoutez le PDF d’un compte-rendu pour le rendre téléchargeable ici.
            </p>
          </div>
        )}

        {reports.map((report) => {
          const daysLeft = getDaysLeft(report.expiresAt);
          return (
            <div key={report.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-base">{report.title}</h3>
                <div className="flex items-center gap-4 text-xs text-stone-500 mt-1">
                  <span>Réunion du {formatDateDDMMYYYY(report.meetingDate)}</span>
                  <span>•</span>
                  <span>{report.fileSizeMb} Mo</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-700 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Encore accessible pendant {daysLeft} jours
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={report.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger le PDF
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(report)}
                  className="p-2 rounded-xl text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Supprimer ce PV"
                  aria-label={`Supprimer ${report.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};