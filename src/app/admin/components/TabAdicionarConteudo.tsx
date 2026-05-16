'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Upload, FileText, Video, X, Loader2, CheckCircle2, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TabAdicionarConteudo({ 
  onSuccess, 
  editingTutorial, 
  onCancel 
}: { 
  onSuccess?: () => void, 
  editingTutorial?: any,
  onCancel?: () => void
}) {
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState(editingTutorial?.video_url && editingTutorial.video_url.includes('youtube.com') ? editingTutorial.video_url : '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [plataformas, setPlataformas] = useState<any[]>([]);
  const [metadata, setMetadata] = useState({
    titulo: editingTutorial?.titulo || '',
    descricao: editingTutorial?.descricao || '',
    plataforma_id: editingTutorial?.plataforma_id || '',
    nivel: editingTutorial?.nivel || 'iniciante',
    tipo: editingTutorial?.tipo || 'video',
    duracao_min: editingTutorial?.duracao_min || 5
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchPlataformas = async () => {
      const { data } = await supabase.from('plataformas').select('id, nome').order('nome');
      if (data) {
        setPlataformas(data);
        if (!editingTutorial && data.length > 0) {
          setMetadata(m => ({ ...m, plataforma_id: data[0].id }));
        }
      }
    };
    fetchPlataformas();
  }, [supabase, editingTutorial]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setYoutubeUrl('');
      // Auto-detect type based on extension
      const ext = e.target.files[0].name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setMetadata(m => ({ ...m, tipo: 'manual' }));
      else if (['mp4', 'mov', 'webm'].includes(ext || '')) setMetadata(m => ({ ...m, tipo: 'video' }));
    }
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSave = async () => {
    setUploading(true);
    setProgress(10);
    
    try {
      let finalContentUrl = editingTutorial?.conteudo_url || youtubeUrl;
      let finalVideoUrl = editingTutorial?.video_url || youtubeUrl;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const folder = metadata.tipo === 'manual' ? 'manuais' : 'videos';
        const filePath = `${folder}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('conteudos')
          .upload(filePath, file, {
            onUploadProgress: (p) => {
              setProgress(10 + Math.round((p.loaded / p.total) * 80));
            }
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('conteudos')
          .getPublicUrl(filePath);
          
        finalContentUrl = data.publicUrl;
        if (metadata.tipo === 'video') finalVideoUrl = data.publicUrl;
        
        // Delete old file if it was a storage file
        if (editingTutorial?.conteudo_url && editingTutorial.conteudo_url.includes('storage/v1/object/public/conteudos/')) {
          const oldPath = editingTutorial.conteudo_url.split('conteudos/')[1];
          await supabase.storage.from('conteudos').remove([oldPath]);
        }
      } else if (youtubeUrl && youtubeUrl !== editingTutorial?.video_url) {
        finalContentUrl = youtubeUrl;
        finalVideoUrl = youtubeUrl;
      }

      const payload = {
        ...metadata,
        video_url: finalVideoUrl || null,
        conteudo_url: finalContentUrl
      };

      if (editingTutorial) {
        const { error: dbError } = await supabase
          .from('tutoriais')
          .update(payload)
          .eq('id', editingTutorial.id);
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('tutoriais')
          .insert([payload]);
        if (dbError) throw dbError;
      }

      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setFile(null);
        setYoutubeUrl('');
        setMetadata({
          titulo: '',
          descricao: '',
          plataforma_id: plataformas[0]?.id || '',
          nivel: 'iniciante',
          tipo: 'video',
          duracao_min: 5
        });
        setProgress(0);
        if (onSuccess) onSuccess();
      }, 1000);

    } catch (error: any) {
      alert('Erro ao guardar tutorial: ' + error.message);
      setUploading(false);
    }
  };

  const youtubeId = getYoutubeId(youtubeUrl);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Painel Esquerdo - Upload */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Upload size={20} className="text-primary" /> Ficheiro ou Link
        </h3>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept=".pdf,.mp4,.mov,.webm"
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-2">
                {file.name.endsWith('.pdf') ? <FileText size={32} /> : <Video size={32} />}
              </div>
              <p className="font-medium text-primary">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="mt-4 text-sm text-red-500 hover:underline flex items-center gap-1"
              >
                <X size={14} /> Remover
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-muted-foreground">
                <Upload size={32} />
              </div>
              <div>
                <p className="font-medium">Arrasta um ficheiro ou clica para selecionar</p>
                <p className="text-sm text-muted-foreground mt-1">PDF até 50MB ou Vídeo até 500MB</p>
              </div>
              <button className="px-6 py-2 bg-white dark:bg-slate-800 border border-border rounded-xl text-sm font-medium shadow-sm">
                Selecionar do PC
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-medium">Ou usa um link</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
            <input 
              type="text" 
              placeholder="Cola aqui o link do YouTube..." 
              value={youtubeUrl}
              onChange={(e) => {
                setYoutubeUrl(e.target.value);
                if (e.target.value) setFile(null);
              }}
              className="w-full pl-12 pr-4 py-3 bg-accent/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          
          <AnimatePresence>
            {youtubeId && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl overflow-hidden border border-border bg-black aspect-video relative"
              >
                <img 
                  src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} 
                  alt="YouTube Preview" 
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white">
                    <Video size={24} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Painel Direito - Metadados */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText size={20} className="text-primary" /> Informações do Tutorial
        </h3>

        <div className="space-y-4 glass p-6 rounded-3xl border-border/50">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título do Tutorial</label>
            <input 
              type="text" 
              placeholder="Ex: Como validar faturas no e-Fatura"
              value={metadata.titulo}
              onChange={(e) => setMetadata(m => ({ ...m, titulo: e.target.value }))}
              className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição (máx. 200 caracteres)</label>
            <textarea 
              maxLength={200}
              placeholder="Breve resumo sobre o que o utilizador vai aprender..."
              value={metadata.descricao}
              onChange={(e) => setMetadata(m => ({ ...m, descricao: e.target.value }))}
              className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plataforma</label>
              <select 
                value={metadata.plataforma_id}
                onChange={(e) => setMetadata(m => ({ ...m, plataforma_id: e.target.value }))}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
              >
                {plataformas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nível</label>
              <select 
                value={metadata.nivel}
                onChange={(e) => setMetadata(m => ({ ...m, nivel: e.target.value }))}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermédio">Intermédio</option>
                <option value="avançado">Avançado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <select 
                value={metadata.tipo}
                onChange={(e) => setMetadata(m => ({ ...m, tipo: e.target.value }))}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="video">Vídeo</option>
                <option value="manual">Manual PDF</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duração (min)</label>
              <input 
                type="number" 
                value={metadata.duracao_min}
                onChange={(e) => setMetadata(m => ({ ...m, duracao_min: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4">
            {editingTutorial && (
              <button 
                onClick={onCancel}
                className="flex-1 px-6 py-3 border border-border rounded-full font-semibold hover:bg-accent transition-all"
              >
                Cancelar
              </button>
            )}
            <button 
              disabled={(!file && !youtubeUrl && !editingTutorial) || !metadata.titulo || uploading}
              onClick={handleSave}
              className={`flex-[2] btn-primary flex items-center justify-center gap-2 ${editingTutorial ? 'bg-secondary hover:shadow-secondary/20' : ''}`}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {progress < 100 ? `A enviar... ${progress}%` : 'A processar...'}
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  {editingTutorial ? 'Atualizar Tutorial' : 'Guardar Tutorial'}
                </>
              )}
            </button>
          </div>
          
          {uploading && (
            <div className="w-full bg-accent rounded-full h-1.5 mt-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
