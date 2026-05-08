import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { ShieldCheck, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react-native';

const classroomLocations = {
  'Data Structures': { lat: 12.9718, lng: 77.5946 },
  'Mathematics': { lat: 12.9725, lng: 77.5950 },
  'Web Development': { lat: 12.9700, lng: 77.5930 },
  'Database Management': { lat: 12.9730, lng: 77.5960 },
  'Computer Networks': { lat: 12.9710, lng: 77.5970 },
};

const initialSubjects = [
  { name: 'Data Structures', total_sessions: 20, attended_sessions: 14, upcoming_sessions: 3, location: classroomLocations['Data Structures'] },
  { name: 'Mathematics', total_sessions: 18, attended_sessions: 13, upcoming_sessions: 4, location: classroomLocations.Mathematics },
  { name: 'Web Development', total_sessions: 16, attended_sessions: 12, upcoming_sessions: 2, location: classroomLocations['Web Development'] },
  { name: 'Database Management', total_sessions: 15, attended_sessions: 11, upcoming_sessions: 3, location: classroomLocations['Database Management'] },
  { name: 'Computer Networks', total_sessions: 17, attended_sessions: 15, upcoming_sessions: 1, location: classroomLocations['Computer Networks'] },
];

const getAttendancePercent = (attended, total) => {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100);
};

export default function AnalyticsScreen() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [markedSubjects, setMarkedSubjects] = useState([]);

  const overallAttendance = useMemo(() => {
    const totalAttended = subjects.reduce((sum, item) => sum + item.attended_sessions, 0);
    const totalSessions = subjects.reduce((sum, item) => sum + item.total_sessions, 0);
    return getAttendancePercent(totalAttended, totalSessions);
  }, [subjects]);

  const insights = useMemo(() => {
    const shortage = subjects
      .filter(item => getAttendancePercent(item.attended_sessions, item.total_sessions) < 75)
      .map(item => {
        const required = Math.max(0, Math.ceil(0.75 * item.total_sessions - item.attended_sessions));
        return `You are ${required} class${required === 1 ? '' : 'es'} short in ${item.name}`;
      });

    const safe = subjects
      .filter(item => getAttendancePercent(item.attended_sessions, item.total_sessions) >= 75)
      .map(item => `You can skip 1 class in ${item.name} safely`);

    const nextRise = subjects
      .map(item => {
        const need = Math.max(0, Math.ceil(0.75 * (item.total_sessions + item.upcoming_sessions) - item.attended_sessions));
        return { name: item.name, sessions: need };
      })
      .sort((a, b) => a.sessions - b.sessions)
      .filter(item => item.sessions > 0);

    const target = nextRise.length ? nextRise[0] : null;

    return [
      ...shortage,
      ...safe.slice(0, 2),
      target ? `Attend next ${target.sessions} sessions to stay above 75% in ${target.name}` : 'Attendance is stable for current subjects',
    ].slice(0, 4);
  }, [subjects]);

  const handleMarkAttendance = (subjectName) => {
    if (markedSubjects.includes(subjectName)) {
      setError('Attendance already marked for this subject today.');
      setStatusMessage(null);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStatusMessage(null);

    // Simulate geolocation delay
    setTimeout(() => {
      setSubjects(prev =>
        prev.map(item =>
          item.name === subjectName
            ? {
                ...item,
                attended_sessions: item.attended_sessions + 1,
                total_sessions: item.total_sessions + 1,
                upcoming_sessions: Math.max(0, item.upcoming_sessions - 1),
              }
            : item
        )
      );
      setMarkedSubjects(prev => [...prev, subjectName]);
      setStatusMessage(`Attendance marked successfully for ${subjectName}.`);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Attendance Module</Text>
        <Text style={styles.headerTitle}>Attendance Dashboard</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        
        {/* Overall Attendance */}
        <View style={styles.card}>
          <View style={styles.overallHeader}>
            <View>
              <Text style={styles.cardEyebrow}>OVERALL ATTENDANCE</Text>
              <Text style={styles.overallPercent}>{overallAttendance}%</Text>
            </View>
            <View style={styles.stableBadge}>
              <Text style={styles.stableBadgeText}>{overallAttendance >= 75 ? 'Stable' : 'At Risk'}</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>Subject-wise attendance summary with live marking support from your current classroom location.</Text>
        </View>

        {/* Live Status */}
        {statusMessage || error ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <CheckCircle2 size={20} color="#000" />
              <Text style={styles.cardTitle}>LIVE STATUS</Text>
            </View>
            {statusMessage && (
              <View style={styles.successAlert}>
                <Text style={styles.successAlertText}>{statusMessage}</Text>
              </View>
            )}
            {error && (
              <View style={styles.errorAlert}>
                <Text style={styles.errorAlertText}>{error}</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Subjects Grid */}
        {subjects.map(subject => {
          const percentage = getAttendancePercent(subject.attended_sessions, subject.total_sessions);
          const isLow = percentage < 75;
          const remainingTo75 = Math.max(0, Math.ceil(0.75 * subject.total_sessions - subject.attended_sessions));

          return (
            <View key={subject.name} style={styles.card}>
              <View style={styles.subjectHeader}>
                <View style={{flex: 1}}>
                  <Text style={styles.cardEyebrow}>{subject.name}</Text>
                  <Text style={styles.subjectPercent}>{percentage}%</Text>
                </View>
                <View style={[styles.statusBadge, isLow ? styles.statusBadgeBad : styles.statusBadgeGood]}>
                  <Text style={[styles.statusBadgeText, isLow ? styles.statusBadgeTextBad : styles.statusBadgeTextGood]}>
                    {isLow ? 'Attention' : 'Good'}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: isLow ? '#ef4444' : '#06b6d4' }]} />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{subject.total_sessions}</Text>
                  <Text style={styles.statLabel}>DONE</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{subject.attended_sessions}</Text>
                  <Text style={styles.statLabel}>ATTENDED</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{subject.upcoming_sessions}</Text>
                  <Text style={styles.statLabel}>UPCOMING</Text>
                </View>
              </View>

              {isLow && (
                <View style={styles.shortageAlert}>
                  <View style={styles.shortageAlertHeader}>
                    <AlertTriangle size={16} color="#b91c1c" />
                    <Text style={styles.shortageAlertTitle}>ATTENDANCE SHORTAGE</Text>
                  </View>
                  <Text style={styles.shortageAlertText}>Attend next {remainingTo75} session{remainingTo75 === 1 ? '' : 's'} to reach 75%.</Text>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.markBtn, isProcessing && styles.markBtnDisabled]} 
                onPress={() => handleMarkAttendance(subject.name)}
                disabled={isProcessing}
              >
                <Text style={styles.markBtnText}>Mark Attendance</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Insights */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={20} color="#000" />
            <Text style={styles.cardTitle}>ATTENDANCE INSIGHTS</Text>
          </View>
          <View style={styles.insightsList}>
            {insights.map((line, index) => (
              <View key={index} style={styles.insightBox}>
                <Text style={styles.insightText}>{line}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Location Marking */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color="#000" />
            <Text style={styles.cardTitle}>LOCATION-BASED MARKING</Text>
          </View>
          <Text style={styles.cardDesc}>This feature checks your current location against classroom coordinates before marking attendance.</Text>
          <View style={styles.locationBox}>
            <Text style={styles.locationTitle}>Classroom coordinates</Text>
            {Object.entries(classroomLocations).map(([name, coords]) => (
              <Text key={name} style={styles.locationText}>{name}: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</Text>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fffbeb' },
  header: { padding: 24, paddingTop: Platform.OS === 'android' ? 48 : 24, paddingBottom: 16, backgroundColor: '#fffbeb' },
  headerSubtitle: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#000' },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 16, gap: 24, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  overallHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 2, color: '#4b5563', textTransform: 'uppercase' },
  overallPercent: { fontSize: 48, fontWeight: '900', color: '#000', marginTop: 8 },
  stableBadge: { backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24 },
  stableBadgeText: { fontSize: 14, fontWeight: '900', color: '#000' },
  cardDesc: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subjectPercent: { fontSize: 36, fontWeight: '900', color: '#000', marginTop: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  statusBadgeGood: { backgroundColor: '#dcfce7' },
  statusBadgeBad: { backgroundColor: '#fee2e2' },
  statusBadgeText: { fontSize: 12, fontWeight: '900' },
  statusBadgeTextGood: { color: '#15803d' },
  statusBadgeTextBad: { color: '#b91c1c' },
  progressBarBg: { height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', marginTop: 20, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  statsGrid: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statBox: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', padding: 12, borderRadius: 4 },
  statNumber: { fontSize: 14, fontWeight: '900', color: '#000' },
  statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: '#4b5563', marginTop: 4 },
  shortageAlert: { marginTop: 16, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#f87171', padding: 16, borderRadius: 4 },
  shortageAlertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  shortageAlertTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1, color: '#b91c1c' },
  shortageAlertText: { fontSize: 14, color: '#b91c1c' },
  markBtn: { marginTop: 20, backgroundColor: '#000', padding: 16, borderRadius: 4, alignItems: 'center' },
  markBtnDisabled: { opacity: 0.5 },
  markBtnText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 1 },
  insightsList: { gap: 12 },
  insightBox: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', padding: 16, borderRadius: 4 },
  insightText: { fontSize: 14, color: '#1f2937', lineHeight: 20 },
  locationBox: { marginTop: 20, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', padding: 16, borderRadius: 4 },
  locationTitle: { fontWeight: '900', color: '#000', marginBottom: 12 },
  locationText: { fontSize: 12, color: '#4b5563', marginBottom: 8 },
  successAlert: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#4ade80', padding: 16, borderRadius: 4 },
  successAlertText: { color: '#166534', fontSize: 14, fontWeight: '500' },
  errorAlert: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#f87171', padding: 16, borderRadius: 4 },
  errorAlertText: { color: '#991b1b', fontSize: 14, fontWeight: '500' },
});
