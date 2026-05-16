'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Trash2, HelpCircle, CheckCircle, Pencil } from 'lucide-react';

export default function TabGerirQuizzes() {
  const [tutoriais, setTutoriais] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [formData, setFormData] = useState({
    tutorial_id: '',
    pergunta: '',
    opcao_a: '',
    opcao_b: '',
    opcao_c: '',
    resposta_correta: 'a'
  });

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: tData } = await supabase.from('tutoriais').select('id, titulo').eq('tipo', 'questionario');
    const { data: qData } = await supabase.from('quizzes').select('*, tutoriais(titulo)');
    
    if (tData) {
      setTutoriais(tData);
      if (tData.length > 0 && !formData.tutorial_id) {
        setFormData(f => ({ ...f, tutorial_id: tData[0].id }));
      }
    }
    if (qData) setQuizzes(qData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuiz) {
      const { error } = await supabase.from('quizzes').update(formData).eq('id', editingQuiz.id);
      if (error) alert(error.message);
      else {
        setEditingQuiz(null);
        resetForm();
        fetchData();
      }
    } else {
      const { error } = await supabase.from('quizzes').insert([formData]);
      if (error) alert(error.message);
      else {
        resetForm();
        fetchData();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tutorial_id: tutoriais[0]?.id || '',
      pergunta: '',
      opcao_a: '',
      opcao_b: '',
      opcao_c: '',
      resposta_correta: 'a'
    });
  };

  const editQuiz = (quiz: any) => {
    setEditingQuiz(quiz);
    setFormData({
      tutorial_id: quiz.tutorial_id,
      pergunta: quiz.pergunta,
      opcao_a: quiz.opcao_a,
      opcao_b: quiz.opcao_b,
      opcao_c: quiz.opcao_c,
      resposta_correta: quiz.resposta_correta
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('Eliminar este quiz?')) return;
    await supabase.from('quizzes').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Side */}
      <div className="lg:col-span-1 space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {editingQuiz ? <Pencil size={20} className="text-secondary" /> : <Plus size={20} className="text-primary" />}
          {editingQuiz ? 'Editar Questionário' : 'Nova Pergunta'}
        </h3>
        <form onSubmit={handleAddQuiz} className="glass p-6 rounded-3xl space-y-4 border-border/50">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tutorial Associado</label>
            <select 
              value={formData.tutorial_id}
              onChange={(e) => setFormData({ ...formData, tutorial_id: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-xl outline-none"
            >
              {tutoriais.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pergunta</label>
            <textarea 
              required
              value={formData.pergunta}
              onChange={(e) => setFormData({ ...formData, pergunta: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-xl outline-none resize-none h-20"
            />
          </div>
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <input type="radio" checked={formData.resposta_correta === 'a'} onChange={() => setFormData({...formData, resposta_correta: 'a'})} />
              <input 
                placeholder="Opção A"
                value={formData.opcao_a}
                onChange={(e) => setFormData({ ...formData, opcao_a: e.target.value })}
                className="flex-1 px-3 py-1 bg-background border border-border rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2 items-center">
              <input type="radio" checked={formData.resposta_correta === 'b'} onChange={() => setFormData({...formData, resposta_correta: 'b'})} />
              <input 
                placeholder="Opção B"
                value={formData.opcao_b}
                onChange={(e) => setFormData({ ...formData, opcao_b: e.target.value })}
                className="flex-1 px-3 py-1 bg-background border border-border rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2 items-center">
              <input type="radio" checked={formData.resposta_correta === 'c'} onChange={() => setFormData({...formData, resposta_correta: 'c'})} />
              <input 
                placeholder="Opção C"
                value={formData.opcao_c}
                onChange={(e) => setFormData({ ...formData, opcao_c: e.target.value })}
                className="flex-1 px-3 py-1 bg-background border border-border rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {editingQuiz && (
              <button 
                type="button" 
                onClick={() => { setEditingQuiz(null); resetForm(); }}
                className="flex-1 px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-accent transition-all"
              >
                Cancelar
              </button>
            )}
            <button type="submit" className={`flex-[2] btn-primary py-2 text-sm ${editingQuiz ? 'bg-secondary' : ''}`}>
              {editingQuiz ? 'Atualizar Pergunta' : 'Criar Pergunta'}
            </button>
          </div>
        </form>
      </div>

      {/* List Side */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HelpCircle size={20} className="text-primary" /> Perguntas Existentes
        </h3>
        <div className="space-y-4">
          {quizzes.map(q => (
            <div key={q.id} className="glass p-5 rounded-2xl border-border/50 group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
                  {q.tutoriais?.titulo}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => editQuiz(q)} className="p-1.5 hover:bg-accent rounded-lg text-primary transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => deleteQuiz(q.id)} className="p-1.5 hover:bg-accent rounded-lg text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="font-medium text-sm mb-4">{q.pergunta}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {['a', 'b', 'c'].map(opt => (
                  <div key={opt} className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between ${q.resposta_correta === opt ? 'bg-green-500/10 border border-green-500/30 text-green-600' : 'bg-accent/50 border border-transparent'}`}>
                    <span>{opt.toUpperCase()}: {q[`opcao_${opt}`]}</span>
                    {q.resposta_correta === opt && <CheckCircle size={14} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
