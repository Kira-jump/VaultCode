import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Project } from '../types';
import { colors, STATUS_COLORS } from './theme';
import { Tag, StatusBadge, ProgressBar } from './UI';

interface Props {
  project: Project;
  onPress: () => void;
  index: number;
}

export function ProjectCard({ project, onPress }: Props) {
  const doneTasks = project.tasks.filter(t => t.done).length;
  const accentColor = STATUS_COLORS[project.status] || colors.accent;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={s.card}>
      <View style={[s.accentBar, { backgroundColor: accentColor }]} />
      <View style={s.content}>
        <View style={s.topRow}>
          <Text style={s.name} numberOfLines={1}>{project.name}</Text>
          <StatusBadge status={project.status} />
        </View>
        {project.desc ? (
          <Text style={s.desc} numberOfLines={2}>{project.desc}</Text>
        ) : null}
        <ProgressBar value={project.progress} />
        <View style={s.bottomRow}>
          <View style={s.tags}>
            {project.stack ? <Tag label={project.stack} color={colors.accent3} /> : null}
            {project.tags.slice(0, 3).map(t => <Tag key={t} label={t} />)}
            {project.tasks.length > 0 && (
              <Tag label={`✓ ${doneTasks}/${project.tasks.length}`} />
            )}
          </View>
          <Text style={s.date}>
            {new Date(project.updatedAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 2, flexDirection: 'row', marginBottom: 10, overflow: 'hidden' },
  accentBar: { width: 3 },
  content: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  name: { fontWeight: '700', fontSize: 15, color: colors.text, flex: 1, letterSpacing: -0.3 },
  desc: { fontSize: 11, color: colors.muted, lineHeight: 16, marginBottom: 4, fontFamily: 'SpaceMono' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  date: { fontSize: 10, color: colors.muted, fontFamily: 'SpaceMono' },
});
