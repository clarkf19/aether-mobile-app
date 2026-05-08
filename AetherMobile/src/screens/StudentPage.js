import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Navigation, AlertTriangle, DoorOpen, AlertCircle, Bell, Zap, Wifi, X, MapPin } from 'lucide-react-native';

const schedules = [
  { id: '1', time: '11:15', subject: 'DAA/PBB/508', type: 'Class', room: 'lab-101b', status: 'ongoing', start_time: '11:15', end_time: '12:15' },
  { id: '2', time: '12:15', subject: 'CCN/AVS/508', type: 'Class', room: 'classroom-202', status: 'next', start_time: '12:15', end_time: '13:15' }
];

const assignmentsData = [
  { id: '1', courseCode: 'DAA/PBB/508', title: 'Algorithm Design Assignment', dueLabel: 'due Tomorrow' },
  { id: '2', courseCode: 'CCN/AVS/508', title: 'Computer Networks Lab', dueLabel: '3 days' }
];

const notificationsData = [
  { id: '1', icon: Bell, title: 'Assignment Reminder', text: 'DAA assignment due tomorrow', timestamp: '5m ago', type: 'assignment', bg: '#fff1f2', pin: '#f43f5e' },
  { id: '2', icon: DoorOpen, title: 'Class Update', text: 'Room changed to lab-101b', timestamp: '15m ago', type: 'room_change', bg: '#fffbeb', pin: '#f59e0b' },
];

export default function StudentPage({ navigation }) {
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const handleDismissAlert = (id) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const getStatusStyles = (status) => {
    switch(status) {
      case 'done': return { bg: '#d1fae5', text: '#064e3b', border: '#10b981' };
      case 'ongoing': return { bg: '#fef3c7', text: '#78350f', border: '#f59e0b' };
      case 'next': return { bg: '#e0f2fe', text: '#0c4a6e', border: '#0ea5e9' };
      default: return { bg: '#ffe4e6', text: '#881337', border: '#f43f5e' };
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Class': return '#e0f2fe';
      case 'Lab': return '#d1fae5';
      case 'Meeting': return '#fef3c7';
      default: return '#ffe4e6';
    }
  };

  const quickActions = [
    { id: 1, label: 'Apply Leave', icon: AlertTriangle, route: 'LeaveRequest' },
    { id: 2, label: 'Approvals', icon: DoorOpen, route: 'Approvals' },
    { id: 3, label: 'Report Issue', icon: AlertCircle, route: 'ReportIssue' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* SMART LIVE BANNER */}
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <View style={styles.pulsingDot} />
            <Text style={styles.bannerText}>
              You have <Text style={styles.fontBlack}>DAA</Text> in <Text style={styles.fontBlack}>508</Text> by <Text style={styles.fontBlack}>PBB</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Map')}>
            <Navigation size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* TIMELINE */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>TODAY'S TIMELINE</Text>
          <View style={styles.timelineContainer}>
            <View style={styles.timelineLine} />
            {schedules.map((item, index) => {
              const statusStyle = getStatusStyles(item.status);
              return (
                <View key={item.id} style={styles.timelineRow}>
                  <View style={styles.timelineNodeContainer}>
                    <View style={[styles.timelineNode, { backgroundColor: statusStyle.border, borderColor: statusStyle.border }]} />
                  </View>
                  <View style={[styles.timelineContent, { backgroundColor: statusStyle.bg, borderColor: '#000', borderWidth: 2 }]}>
                    <View style={styles.timelineContentHeader}>
                      <Text style={styles.timelineTime}>{item.time}</Text>
                      {item.status === 'ongoing' && (
                        <View style={styles.liveBadge}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>LIVE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.timelineSubject}>{item.subject}</Text>
                    <View style={styles.timelineFooter}>
                      <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                        <Text style={styles.typeText}>{item.type}</Text>
                      </View>
                      <Text style={styles.roomText}>{item.room}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ASSIGNMENTS */}
        <View style={styles.card}>
          <View style={styles.assignmentHeaderContainer}>
            <Text style={styles.sectionHeader}>ASSIGNMENTS</Text>
            <View style={styles.assignmentCountBadge}>
              <Text style={styles.assignmentCountText}>{assignmentsData.length} due</Text>
            </View>
          </View>
          
          <View style={styles.featuredAssignment}>
            <Text style={styles.featuredTitle}>{assignmentsData[0].title}</Text>
            <Text style={styles.featuredSubtitle}>{assignmentsData[0].courseCode} · {assignmentsData[0].dueLabel}</Text>
          </View>
          
          <View style={styles.otherAssignments}>
            {assignmentsData.slice(1).map((assignment) => (
              <View key={assignment.id} style={styles.assignmentRow}>
                <Text style={styles.assignmentTitleRow}>{assignment.title}</Text>
                <Text style={styles.assignmentDueRow}>{assignment.dueLabel}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CGPA */}
        <View style={[styles.card, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.sectionHeader}>CURRENT CGPA</Text>
          <View style={styles.cgpaFlex}>
            <View>
              <Text style={styles.cgpaText}>8.76</Text>
              <Text style={styles.cgpaSub}>Last Updated: Dec 15, 2024</Text>
            </View>
            <View style={styles.cgpaBox}>
              <View style={styles.cgpaFill}>
                <Text style={styles.cgpaPercentage}>87.6%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <View style={[styles.card, { backgroundColor: '#f3f4f6' }]}>
          <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
          <View style={styles.notificationsGrid}>
            {notificationsData.filter(a => !dismissedAlerts.includes(a.id)).map((alert, index) => {
              const Icon = alert.icon;
              return (
                <View key={alert.id} style={styles.stickyWrapper}>
                  <View style={[styles.stickyNote, { backgroundColor: alert.bg }]}>
                    <View style={[styles.pin, { backgroundColor: alert.pin }]} />
                    
                    <View style={styles.stickyContent}>
                      <View style={styles.stickyHeader}>
                        <Icon size={16} color="#000" />
                        <Text style={styles.stickyTitle} numberOfLines={1}>{alert.title}</Text>
                      </View>
                      <Text style={styles.stickyText} numberOfLines={2}>{alert.text}</Text>
                    </View>
                    <Text style={styles.stickyTime}>{alert.timestamp}</Text>
                  </View>
                  <TouchableOpacity style={styles.dismissButton} onPress={() => handleDismissAlert(alert.id)}>
                    <X size={12} color="#000" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity 
                key={action.id} 
                style={styles.actionButton}
                onPress={() => navigation.navigate(action.route)}
              >
                <Icon size={20} color="#000" />
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, { marginTop: 16, backgroundColor: '#ffe4e6' }]} 
          onPress={() => navigation.replace('Login')}
        >
          <Text style={[styles.actionText, { color: '#e11d48' }]}>Logout</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Last updated 2 seconds ago · All systems operational</Text>
        </View>
        
      </ScrollView>

      {/* Floating Action Button for Copilot */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AiCopilot')}
        activeOpacity={0.8}
      >
        <Zap size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EAF4FF',
  },
  container: {
    padding: 16,
    paddingBottom: 24, // reduced since we use native bottom tabs now
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  banner: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pulsingDot: {
    width: 12,
    height: 12,
    backgroundColor: '#ef4444',
    borderRadius: 6,
    marginRight: 12,
  },
  bannerText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  fontBlack: {
    fontWeight: '900',
  },
  navButton: {
    padding: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4b5563',
    letterSpacing: 2,
    marginBottom: 16,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 8,
    bottom: 0,
    width: 2,
    backgroundColor: '#e5e7eb',
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  timelineNodeContainer: {
    position: 'absolute',
    left: -24,
    top: 16,
    width: 16,
    alignItems: 'center',
  },
  timelineNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  timelineContent: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#000',
  },
  timelineContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineTime: {
    fontWeight: '900',
    fontSize: 14,
    color: '#000',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#f59e0b',
    borderRadius: 4,
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#d97706',
  },
  timelineSubject: {
    fontWeight: '700',
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  timelineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  roomText: {
    fontSize: 12,
    color: '#4b5563',
  },
  assignmentHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  assignmentCountBadge: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  assignmentCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f97316',
  },
  featuredAssignment: {
    marginBottom: 16,
  },
  featuredTitle: {
    fontWeight: '900',
    fontSize: 18,
    color: '#000',
  },
  featuredSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  otherAssignments: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    gap: 12,
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentTitleRow: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  assignmentDueRow: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  cgpaFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cgpaText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000',
  },
  cgpaSub: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  cgpaBox: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    padding: 8,
  },
  cgpaFill: {
    flex: 1,
    backgroundColor: '#86efac', // lime-300 approx
    borderBottomWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cgpaPercentage: {
    fontWeight: '900',
    color: '#000',
    fontSize: 14,
  },
  notificationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stickyWrapper: {
    width: '47%',
    position: 'relative',
    marginBottom: 8,
  },
  stickyNote: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 16,
    height: 140,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  pin: {
    position: 'absolute',
    top: -6,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000',
    zIndex: 10,
  },
  stickyContent: {
    flex: 1,
  },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  stickyTitle: {
    fontWeight: '700',
    fontSize: 12,
    color: '#000',
    flex: 1,
  },
  stickyText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.75)',
  },
  stickyTime: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 8,
    marginTop: 8,
  },
  dismissButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  actionText: {
    fontWeight: '700',
    color: '#000',
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderTopColor: '#000',
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 32, // for safe area bottom on iOS somewhat handled natively but adding manual padding
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navItemTextActive: {
    fontWeight: '900',
    color: '#000',
    fontSize: 16,
  },
  navItemText: {
    fontWeight: '600',
    color: '#6b7280',
    fontSize: 16,
  }
});
