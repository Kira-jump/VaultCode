import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, StatusBar, Share,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Project, ProjectStatus } from '../types';
import { loadProjects, addProject, updateProject, deleteProject, exportData } from '../store/projects';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectForm } from '../components/ProjectForm';
import { EmptyState, SectionLabel } from '../components/UI';
import { colors } from '../components/theme';

type Filter = 'all' | ProjectStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'wip', label: 'En cours' },
  { key: 'done', label: 'Terminés' },
  { key: 'pause', label: 'En pause' },
  { key: 'idea', label: 'Idées' },
];
const STATUS_ORDER: Record<string, number> = { wip: 0, idea: 1, pause: 2, done: 3 };

export default function HomeScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    const data = await loadProjects();
    setProjects(data);
  }, []);

  useFocusEffect(useCallback(() => { fetchProjects(); }, [fetchProjects]));

  const filtered = projects
    .filter(p => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) ||
          (p.desc || '').toLowerCase().includes(q) ||
          (p.stack || '').toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4));

  const handleSave = async (data: any) => {
    if (data.id) await updateProject(data.id, data);
    else await addProject(data);
    await fetchProjects();
    setFormVisible(false);
    setEditingProject(null);
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    await fetchProjects();
    setFormVisible(false);
    setEditingProject(null);
  };

  const handleExport = async () => {
    const json = await exportData();
    await Share.share({ message: json, title: 'VaultCode Export' });
  };

  const countWip = projects.filter(p => p.status === 'wip').length;
  const countDone = projects.filter(p => p.status === 'done').length;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoDot} />
          <Text style={s.logo}>VaultCode</Text>
        </View>
        <View style={s.statsRow}>
          <Stat label="projets" value={projects.length} />
          <Stat label="en cours" value={countWip} />
          <Stat label="finis" value={countDone} />
          <TouchableOpacity onPress={handleExport} style={s.exportBtn}>
            <Text style={s.exportTxt}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchPrefix}>&gt;</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="rechercher..."
          placeholderTextColor={colors.muted}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={s.clearSearch}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={f => f.key}
        style={{ maxHeight: 42, marginTop: 10 }}
        contentContainerStyle={s.filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFilter(item.key)}
            style={[s.filterBtn, filter === item.key && s.filterBtnActive]}
          >
            <Text style={[s.filterTxt, filter === item.key && s.filterTxtActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        contentContainerStyle={s.list}
        ListHeaderComponent={<SectionLabel label="projets" />}
        ListEmptyComponent={
          <EmptyState message={'Aucun projet ici.\nAppuie sur + pour commencer.'} />
        }
        renderItem={({ item, index }) => (
          <ProjectCard
            project={item}
            index={index}
            onPress={() => { setEditingProject(item); setFormVisible(true); }}
          />
        )}
      />

      <TouchableOpacity
        style={s.fab}
        onPress={() => { setEditingProject(null); setFormVisible(true); }}
        activeOpacity={0.8}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      <ProjectForm
        visible={formVisible}
        project={editingProject}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => { setFormVisible(false); setEditingProject(null); }}
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.stat}>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  logo: { fontWeight: '800', fontSize: 20, color: colors.text, letterSpacing: -0.5 },
  statsRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '700', color: colors.accent, fontFamily: 'SpaceMono' },
  statLabel: { fontSize: 9, color: colors.muted, fontFamily: 'SpaceMono' },
  exportBtn: { width: 28, height: 28, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  exportTxt: { color: colors.muted, fontSize: 14 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 12 },
  searchPrefix: { color: colors.accent, fontSize: 13, fontFamily: 'SpaceMono', marginRight: 6 },
  searchInput: { flex: 1, color: colors.text, fontFamily: 'SpaceMono', fontSize: 13, paddingVertical: 10 },
  clearSearch: { color: colors.muted, fontSize: 12, paddingLeft: 8 },
  filters: { paddingHorizontal: 16, gap: 6, alignItems: 'center' },
  filterBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 2, paddingHorizontal: 12, paddingVertical: 6 },
  filterBtnActive: { borderColor: colors.accent, backgroundColor: colors.accent + '15' },
  filterTxt: { fontSize: 10, color: colors.muted, fontFamily: 'SpaceMono', textTransform: 'uppercase', letterSpacing: 1 },
  filterTxtActive: { color: colors.accent },
  list: { padding: 16, paddingBottom: 100 },
  fab: { position: 'absolute', bottom: 28, right: 20, width: 56, height: 56, backgroundColor: colors.accent, borderRadius: 2, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  fabText: { fontSize: 30, color: colors.bg, fontWeight: '700', lineHeight: 36 },
});
