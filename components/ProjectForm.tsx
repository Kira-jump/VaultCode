import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Project, ProjectStatus, Task, Note, Link } from '../types';
import { colors, STATUS_LABELS } from './theme';
import { Button, Divider } from './UI';
import { genId } from '../store/projects';

interface Props {
  visible: boolean;
  project?: Project | null;
  onSave: (data: any) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const STATUSES: ProjectStatus[] = ['idea', 'wip', 'pause', 'done'];
const TABS = ['infos', 'tasks', 'notes', 'links'] as const;
type Tab = typeof TABS[number];

export function ProjectForm({ visible, project, onSave, onDelete, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('infos');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('wip');
  const [stack, setStack] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [progress, setProgress] = useState('0');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name); setDesc(project.desc || '');
      setStatus(project.status); setStack(project.stack || '');
      setTagsRaw(project.tags.join(', '));
      setProgress(String(project.progress));
      setTasks([...project.tasks]);
      setNotes([...project.notes]);
      setLinks([...project.links]);
    } else {
      setName(''); setDesc(''); setStatus('wip'); setStack('');
      setTagsRaw(''); setProgress('0');
      setTasks([]); setNotes([]); setLinks([]);
    }
    setTab('infos');
    setNewTask(''); setNewNote('');
    setNewLinkLabel(''); setNewLinkUrl('');
  }, [project, visible]);

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Erreur', 'Le nom est obligatoire.'); return; }
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
    onSave({ id: project?.id, name: name.trim(), desc: desc.trim(), status, stack: stack.trim(), tags, progress: Math.min(100, Math.max(0, parseInt(progress) || 0)), tasks, notes, links });
  };

  const confirmDelete = () => {
    Alert.alert('Supprimer', 'Supprimer ce projet ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => { onDelete?.(project!.id); onClose(); } },
    ]);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(p => [...p, { id: genId(), text: newTask.trim(), done: false }]);
    setNewTask('');
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(p => [{ id: genId(), text: newNote.trim(), date: Date.now() }, ...p]);
    setNewNote('');
  };

  const addLink = () => {
    if (!newLinkUrl.trim()) return;
    setLinks(p => [...p, { id: genId(), label: newLinkLabel.trim() || newLinkUrl.trim(), url: newLinkUrl.trim() }]);
    setNewLinkLabel(''); setNewLinkUrl('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.container}>
          <View style={s.header}>
            <Text style={s.title}>{project ? 'Modifier' : 'Nouveau projet'}</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={s.tabs}>
            {TABS.map(t => (
              <TouchableOpacity key={t} onPress={() => setTab(t)} style={[s.tab, tab === t && s.tabActive]}>
                <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
            <View style={s.tabContent}>

              {tab === 'infos' && <>
                <Field label="NOM *">
                  <TextInput style={s.input} value={name} onChangeText={setName} placeholder="mon-projet" placeholderTextColor={colors.muted} />
                </Field>
                <Field label="DESCRIPTION">
                  <TextInput style={[s.input, s.textarea]} value={desc} onChangeText={setDesc} multiline placeholder="C'est quoi le concept ?" placeholderTextColor={colors.muted} />
                </Field>
                <Field label="STATUT">
                  <View style={s.statusRow}>
                    {STATUSES.map(st => (
                      <TouchableOpacity key={st} onPress={() => setStatus(st)} style={[s.statusBtn, status === st && s.statusBtnActive]}>
                        <Text style={[s.statusTxt, status === st && s.statusTxtActive]}>{STATUS_LABELS[st]}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Field>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Field label="STACK">
                      <TextInput style={s.input} value={stack} onChangeText={setStack} placeholder="React, Python..." placeholderTextColor={colors.muted} />
                    </Field>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="TAGS">
                      <TextInput style={s.input} value={tagsRaw} onChangeText={setTagsRaw} placeholder="web, api" placeholderTextColor={colors.muted} />
                    </Field>
                  </View>
                </View>
                <Field label={`PROGRESSION — ${progress}%`}>
                  <TextInput style={s.input} value={progress} onChangeText={setProgress} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.muted} />
                  <Text style={s.hint}>Saisis un nombre entre 0 et 100</Text>
                </Field>
              </>}

              {tab === 'tasks' && <>
                <View style={s.addRow}>
                  <TextInput style={[s.input, { flex: 1 }]} value={newTask} onChangeText={setNewTask} placeholder="Nouvelle tâche..." placeholderTextColor={colors.muted} onSubmitEditing={addTask} returnKeyType="done" />
                  <TouchableOpacity onPress={addTask} style={s.addBtn}><Text style={s.addBtnTxt}>+</Text></TouchableOpacity>
                </View>
                <Divider />
                {tasks.length === 0 && <Text style={s.empty}>Aucune tâche</Text>}
                {tasks.map((task, i) => (
                  <View key={task.id} style={s.taskRow}>
                    <TouchableOpacity onPress={() => setTasks(p => p.map((t, j) => j === i ? { ...t, done: !t.done } : t))} style={[s.checkbox, task.done && s.checkboxDone]}>
                      {task.done && <Text style={s.checkMark}>✓</Text>}
                    </TouchableOpacity>
                    <Text style={[s.taskTxt, task.done && s.taskDone]}>{task.text}</Text>
                    <TouchableOpacity onPress={() => setTasks(p => p.filter((_, j) => j !== i))}>
                      <Text style={s.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>}

              {tab === 'notes' && <>
                <View style={s.addRow}>
                  <TextInput style={[s.input, { flex: 1 }]} value={newNote} onChangeText={setNewNote} placeholder="Nouvelle note..." placeholderTextColor={colors.muted} onSubmitEditing={addNote} returnKeyType="done" />
                  <TouchableOpacity onPress={addNote} style={s.addBtn}><Text style={s.addBtnTxt}>+</Text></TouchableOpacity>
                </View>
                <Divider />
                {notes.length === 0 && <Text style={s.empty}>Aucune note</Text>}
                {notes.map((note, i) => (
                  <View key={note.id} style={s.noteCard}>
                    <Text style={s.noteDate}>{new Date(note.date).toLocaleString('fr-FR')}</Text>
                    <Text style={s.noteTxt}>{note.text}</Text>
                    <TouchableOpacity onPress={() => setNotes(p => p.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 6, right: 8 }}>
                      <Text style={s.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>}

              {tab === 'links' && <>
                <Field label="LABEL">
                  <TextInput style={s.input} value={newLinkLabel} onChangeText={setNewLinkLabel} placeholder="GitHub, Démo..." placeholderTextColor={colors.muted} />
                </Field>
                <Field label="URL">
                  <TextInput style={s.input} value={newLinkUrl} onChangeText={setNewLinkUrl} placeholder="https://..." placeholderTextColor={colors.muted} keyboardType="url" autoCapitalize="none" />
                </Field>
                <Button label="+ AJOUTER" onPress={addLink} variant="ghost" />
                <Divider />
                {links.length === 0 && <Text style={s.empty}>Aucun lien</Text>}
                {links.map((link, i) => (
                  <View key={link.id} style={s.linkRow}>
                    <Text style={s.linkTxt} numberOfLines={1}>🔗 {link.label}</Text>
                    <TouchableOpacity onPress={() => setLinks(p => p.filter((_, j) => j !== i))}>
                      <Text style={s.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>}

            </View>

            <View style={{ padding: 16 }}>
              <Button label="SAUVEGARDER" onPress={handleSave} />
              {project && <Button label="🗑 SUPPRIMER" onPress={confirmDelete} variant="danger" style={{ marginTop: 10 } as any} />}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  closeBtn: { width: 32, height: 32, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { color: colors.muted, fontSize: 14 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { fontSize: 10, color: colors.muted, letterSpacing: 1, fontFamily: 'SpaceMono' },
  tabTextActive: { color: colors.accent },
  tabContent: { padding: 16 },
  label: { fontSize: 10, color: colors.muted, letterSpacing: 1.5, marginBottom: 6, fontFamily: 'SpaceMono' },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 2, color: colors.text, fontFamily: 'SpaceMono', fontSize: 13, paddingHorizontal: 12, paddingVertical: 10 },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  hint: { fontSize: 10, color: colors.muted, marginTop: 4, fontFamily: 'SpaceMono' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 2, paddingHorizontal: 10, paddingVertical: 6 },
  statusBtnActive: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  statusTxt: { fontSize: 11, color: colors.muted, fontFamily: 'SpaceMono' },
  statusTxtActive: { color: colors.accent },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  addBtn: { width: 40, height: 40, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  addBtnTxt: { fontSize: 22, color: colors.accent },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  checkboxDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkMark: { fontSize: 11, color: colors.bg },
  taskTxt: { flex: 1, fontSize: 13, color: colors.text, fontFamily: 'SpaceMono' },
  taskDone: { textDecorationLine: 'line-through', color: colors.muted },
  removeBtn: { color: colors.muted, fontSize: 14, padding: 4 },
  noteCard: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 2, borderLeftColor: colors.accent3, padding: 12, marginBottom: 8 },
  noteDate: { fontSize: 9, color: colors.muted, fontFamily: 'SpaceMono', marginBottom: 4 },
  noteTxt: { fontSize: 12, color: colors.text, lineHeight: 18, fontFamily: 'SpaceMono' },
  linkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, padding: 10, marginBottom: 6, gap: 8 },
  linkTxt: { flex: 1, fontSize: 13, color: colors.accent3, fontFamily: 'SpaceMono' },
  empty: { color: colors.muted, fontFamily: 'SpaceMono', fontSize: 12, paddingVertical: 20, textAlign: 'center' },
});
