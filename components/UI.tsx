import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, STATUS_COLORS, STATUS_LABELS } from './theme';
import { ProjectStatus } from '../types';

export function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <View style={[s.tag, color ? { borderColor: color + '66' } : {}]}>
      <Text style={[s.tagText, color ? { color } : {}]}>{label}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const c = STATUS_COLORS[status] || colors.muted;
  return (
    <View style={[s.badge, { borderColor: c, backgroundColor: c + '22' }]}>
      <Text style={[s.badgeText, { color: c }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <View style={s.progressRow}>
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${value}%` as any }]} />
      </View>
      <Text style={s.progressLabel}>{value}%</Text>
    </View>
  );
}

export function SectionLabel({ label }: { label: string }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionText}>{label.toUpperCase()}</Text>
      <View style={s.sectionLine} />
    </View>
  );
}

export function Divider() {
  return <View style={s.divider} />;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={s.emptyWrap}>
      <Text style={s.emptyAscii}>{'╔══════════╗\n║  NO DATA ║\n╚══════════╝'}</Text>
      <Text style={s.emptyText}>{message}</Text>
    </View>
  );
}

export function Button({ label, onPress, variant = 'primary' }: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'ghost';
}) {
  const btnStyle = variant === 'primary' ? s.btnPrimary
    : variant === 'danger' ? s.btnDanger : s.btnGhost;
  const txtStyle = variant === 'primary' ? s.btnPrimaryText
    : variant === 'danger' ? s.btnDangerText : s.btnGhostText;
  return (
    <TouchableOpacity onPress={onPress} style={btnStyle} activeOpacity={0.75}>
      <Text style={txtStyle}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  tag: { borderWidth: 1, borderColor: colors.border, borderRadius: 2, paddingHorizontal: 7, paddingVertical: 2, marginRight: 4, marginBottom: 4 },
  tagText: { fontSize: 10, color: colors.muted, fontFamily: 'SpaceMono' },
  badge: { borderWidth: 1, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1, fontFamily: 'SpaceMono' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 },
  progressBg: { flex: 1, height: 3, backgroundColor: colors.surface2, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.accent },
  progressLabel: { fontSize: 10, color: colors.muted, fontFamily: 'SpaceMono', minWidth: 30, textAlign: 'right' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 4 },
  sectionText: { fontSize: 10, color: colors.muted, letterSpacing: 2, fontFamily: 'SpaceMono' },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.border },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyAscii: { fontFamily: 'SpaceMono', fontSize: 11, color: colors.muted, opacity: 0.4, textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  emptyText: { fontFamily: 'SpaceMono', fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  btnPrimary: { backgroundColor: colors.accent, paddingVertical: 14, alignItems: 'center', borderRadius: 2 },
  btnPrimaryText: { color: colors.bg, fontWeight: '800', fontSize: 13, letterSpacing: 2, fontFamily: 'SpaceMono' },
  btnDanger: { borderWidth: 1, borderColor: colors.danger, paddingVertical: 10, alignItems: 'center', borderRadius: 2 },
  btnDangerText: { color: colors.danger, fontSize: 11, letterSpacing: 1.5, fontFamily: 'SpaceMono' },
  btnGhost: { borderWidth: 1, borderColor: colors.border, paddingVertical: 10, alignItems: 'center', borderRadius: 2 },
  btnGhostText: { color: colors.muted, fontSize: 11, fontFamily: 'SpaceMono' },
});
