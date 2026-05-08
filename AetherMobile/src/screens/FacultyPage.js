import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Clock, Users, Bell, LogOut, Zap, Check, X, CheckCircle, TrendingUp, AlertCircle, DollarSign, Building2, BookOpen, DoorOpen, MessageCircle, AlertTriangle } from 'lucide-react-native';
import { API_ENDPOINTS } from '../apiConfig';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fffbeb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: Platform.OS === 'android' ? 48 : 16, backgroundColor: '#fff', borderBottomWidth: 2, borderBottomColor: '#000' },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#000' },
  headerSubtitle: { fontSize: 14, color: '#4b5563', fontWeight: '600' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 10, borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', borderRadius: 8 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#000', borderWidth: 2, borderColor: '#000', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
  
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, minWidth: '45%', borderWidth: 2, borderColor: '#000', padding: 16, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#4b5563', textTransform: 'uppercase' },
  statValue: { fontSize: 32, fontWeight: '900', marginTop: 4 },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterBtn: { borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8 },
  filterBtnActive: { backgroundColor: '#000' },
  filterBtnText: { fontSize: 12, fontWeight: '800', color: '#000', textTransform: 'capitalize' },
  filterBtnTextActive: { color: '#fff' },

  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardIconBox: { width: 48, height: 48, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#000' },
  cardSubtitle: { fontSize: 12, fontWeight: '700', color: '#4b5563', textTransform: 'uppercase', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#4b5563', marginTop: 4 },
  cardRight: { minWidth: 100, alignItems: 'flex-end', justifyContent: 'space-between' },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 2, marginBottom: 8 },
  statusBadgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderWidth: 2, borderColor: '#000' },
  actionBtnText: { fontWeight: '900', fontSize: 14, marginLeft: 6 },
  
  // Custom boxes
  amountBox: { backgroundColor: '#000', padding: 8, borderWidth: 2, borderColor: '#000', marginBottom: 8, alignItems: 'center', width: '100%' },
  amountLabel: { fontSize: 10, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
  amountValue: { fontSize: 18, fontWeight: '900', color: '#fff' },
});

// --- DASHBOARDS ---

function HODDashboard({ navigation }) {
  const [filter, setFilter] = useState('all');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const [certRes, leaveRes] = await Promise.all([
        fetch(API_ENDPOINTS.certificates),
        fetch(API_ENDPOINTS.leaves)
      ]);
      const certs = certRes.ok ? await certRes.json() : [];
      const leaves = leaveRes.ok ? await leaveRes.json() : [];
      
      const formattedCerts = certs.map(r => ({
        id: r.id, studentName: r.studentName || r.student_name, uid: r.studentId || 'N/A', type: 'certificate',
        status: r.status, description: r.certificateType ? `${r.certificateType} - ${r.purpose}` : r.purpose
      }));
      const formattedLeaves = leaves.map(r => ({
        id: r.id, studentName: r.studentName, uid: 'N/A', type: 'leave',
        status: r.status, description: r.leaveType ? `${r.leaveType} on ${r.date}` : 'Leave Request'
      }));
      
      setRequests([...formattedCerts, ...formattedLeaves]);
    } catch (e) {
      console.log('Error fetching HOD requests', e);
    }
  };

  const handleAction = (id, newStatus) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    Alert.alert('Success', `Request ${newStatus}`);
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: '#d97706' }]}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={[styles.statValue, { color: '#d97706' }]}>{pendingCount}</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#16a34a' }]}>
          <Text style={styles.statLabel}>Approved</Text>
          <Text style={[styles.statValue, { color: '#16a34a' }]}>{approvedCount}</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#dc2626' }]}>
          <Text style={styles.statLabel}>Rejected</Text>
          <Text style={[styles.statValue, { color: '#dc2626' }]}>{rejectedCount}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Student Requests</Text>
      {filtered.map(req => (
        <View key={req.id} style={[styles.card, req.type === 'certificate' ? {backgroundColor: '#eff6ff'} : {backgroundColor: '#f0fdf4'}]}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconBox}>
              {req.type === 'certificate' ? <BookOpen color="#fff" /> : <DoorOpen color="#fff" />}
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{req.studentName}</Text>
              <Text style={styles.cardSubtitle}>UID: {req.uid} • {req.type}</Text>
              <Text style={styles.cardDesc}>{req.description}</Text>
            </View>
            <View style={styles.cardRight}>
              <View style={[styles.statusBadge, req.status === 'pending' ? {backgroundColor: '#fef9c3', borderColor: '#eab308'} : req.status === 'approved' ? {backgroundColor: '#dcfce7', borderColor: '#22c55e'} : {backgroundColor: '#fee2e2', borderColor: '#ef4444'}]}>
                <Text style={[styles.statusBadgeText, req.status === 'pending' ? {color: '#854d0e'} : req.status === 'approved' ? {color: '#166534'} : {color: '#991b1b'}]}>{req.status}</Text>
              </View>
            </View>
          </View>
          {req.status === 'pending' && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#22c55e', borderColor: '#16a34a'}]} onPress={() => handleAction(req.id, 'approved')}>
                <CheckCircle size={16} color="#fff" />
                <Text style={[styles.actionBtnText, {color: '#fff'}]}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#ef4444', borderColor: '#dc2626'}]} onPress={() => handleAction(req.id, 'rejected')}>
                <X size={16} color="#fff" />
                <Text style={[styles.actionBtnText, {color: '#fff'}]}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function DeanDashboard({ navigation }) {
  const [filter, setFilter] = useState('all');
  const [requests, setRequests] = useState([
    // Keep mock budgets since there is no budget API yet
    { id: 'mock-1', title: 'Tech Summit Participation', type: 'reimbursement', amount: 15000, description: 'Travel for national tech conference', requestedBy: 'Prof. Sharma', status: 'pending' },
    { id: 'mock-2', title: 'Lab Equipment Purchase', type: 'budget', amount: 85000, description: 'New servers for research lab', requestedBy: 'Dr. Patel', status: 'pending' },
  ]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.rooms);
      const rooms = res.ok ? await res.json() : [];
      
      const formattedRooms = rooms.map(r => ({
        id: r.id, title: 'Room Booking', type: 'room', amount: 0,
        description: `${r.roomName || r.room_name} - ${r.bookingDate || r.booking_date} (${r.startTime || r.start_time} - ${r.endTime || r.end_time})`,
        requestedBy: r.studentName || r.student_name, status: r.status
      }));
      
      // Preserve mock budget items when updating state
      setRequests(prev => {
        const budgets = prev.filter(p => p.id.startsWith('mock-'));
        return [...budgets, ...formattedRooms];
      });
    } catch (e) {
      console.log('Error fetching Dean requests', e);
    }
  };

  const handleAction = (id, newStatus) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    Alert.alert('Success', `Request ${newStatus}`);
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const totalAmount = requests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: '#000' }]}>
          <Text style={styles.statLabel}>Pending Amount</Text>
          <Text style={[styles.statValue, { color: '#2563eb' }]}>₹{totalAmount / 1000}k</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#000' }]}>
          <Text style={styles.statLabel}>Pending Requests</Text>
          <Text style={[styles.statValue, { color: '#d97706' }]}>{requests.filter(r => r.status === 'pending').length}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Budget & Reimbursements</Text>
      {filtered.map(req => (
        <View key={req.id} style={[styles.card, req.type === 'budget' ? {backgroundColor: '#eff6ff'} : {backgroundColor: '#f0fdf4'}]}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconBox}>
              <DollarSign color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{req.title}</Text>
              <Text style={styles.cardSubtitle}>{req.type} • By {req.requestedBy}</Text>
              <Text style={styles.cardDesc}>{req.description}</Text>
            </View>
            <View style={styles.cardRight}>
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amountValue}>₹{req.amount}</Text>
              </View>
              <View style={[styles.statusBadge, req.status === 'pending' ? {backgroundColor: '#fef9c3', borderColor: '#eab308'} : req.status === 'approved' ? {backgroundColor: '#dcfce7', borderColor: '#22c55e'} : {backgroundColor: '#fee2e2', borderColor: '#ef4444'}]}>
                <Text style={[styles.statusBadgeText, req.status === 'pending' ? {color: '#854d0e'} : req.status === 'approved' ? {color: '#166534'} : {color: '#991b1b'}]}>{req.status}</Text>
              </View>
            </View>
          </View>
          {req.status === 'pending' && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#22c55e', borderColor: '#16a34a'}]} onPress={() => handleAction(req.id, 'approved')}>
                <CheckCircle size={16} color="#fff" />
                <Text style={[styles.actionBtnText, {color: '#fff'}]}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#ef4444', borderColor: '#dc2626'}]} onPress={() => handleAction(req.id, 'rejected')}>
                <X size={16} color="#fff" />
                <Text style={[styles.actionBtnText, {color: '#fff'}]}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function HRDashboard({ navigation }) {
  const [filter, setFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.issues);
      const data = res.ok ? await res.json() : { issues: [] };
      const formatted = data.issues.map(i => ({
        id: i.id, type: i.category, description: i.description,
        status: i.status, priority: i.severity,
        reportedBy: i.student_name, reportedDate: i.created_at, location: i.location
      }));
      setIssues(formatted);
    } catch (e) {
      console.log('Error fetching HR issues', e);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setIssues(issues.map(i => i.id === id ? { ...i, status: newStatus } : i));
  };

  const filtered = filter === 'all' ? issues : issues.filter(i => i.status === filter);
  const openCount = issues.filter(i => i.status === 'open').length;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: '#e11d48', backgroundColor: '#fff1f2' }]}>
          <Text style={styles.statLabel}>Open Tickets</Text>
          <Text style={[styles.statValue, { color: '#e11d48' }]}>{openCount}</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' }]}>
          <Text style={styles.statLabel}>In Progress</Text>
          <Text style={[styles.statValue, { color: '#0ea5e9' }]}>{issues.filter(i => i.status === 'in-progress').length}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {['all', 'open', 'in-progress', 'resolved'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Support Tickets</Text>
      {filtered.map(issue => (
        <TouchableOpacity key={issue.id} style={[styles.card, selectedIssue === issue.id && { borderColor: '#0ea5e9', borderWidth: 3 }]} onPress={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)} activeOpacity={0.9}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconBox}>
              {issue.type === 'IT' ? <Zap color="#fff" /> : <AlertTriangle color="#fff" />}
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{issue.type} Issue</Text>
              <Text style={styles.cardSubtitle}>Location: {issue.location}</Text>
              <Text style={styles.cardDesc} numberOfLines={selectedIssue === issue.id ? 0 : 2}>{issue.description}</Text>
            </View>
            <View style={styles.cardRight}>
              <View style={[styles.statusBadge, issue.priority === 'high' ? {backgroundColor: '#fecdd3', borderColor: '#e11d48'} : {backgroundColor: '#fef3c7', borderColor: '#d97706'}]}>
                <Text style={[styles.statusBadgeText, issue.priority === 'high' ? {color: '#be123c'} : {color: '#b45309'}]}>{issue.priority}</Text>
              </View>
              <View style={[styles.statusBadge, issue.status === 'open' ? {backgroundColor: '#fef9c3', borderColor: '#eab308'} : issue.status === 'in-progress' ? {backgroundColor: '#e0f2fe', borderColor: '#0ea5e9'} : {backgroundColor: '#dcfce7', borderColor: '#22c55e'}]}>
                <Text style={[styles.statusBadgeText, issue.status === 'open' ? {color: '#854d0e'} : issue.status === 'in-progress' ? {color: '#0369a1'} : {color: '#166534'}]}>{issue.status}</Text>
              </View>
            </View>
          </View>
          
          {selectedIssue === issue.id && (
            <View style={{marginTop: 16, paddingTop: 16, borderTopWidth: 2, borderTopColor: '#e5e7eb'}}>
              <Text style={{fontSize: 12, fontWeight: '900', marginBottom: 8}}>UPDATE STATUS</Text>
              <View style={{flexDirection: 'row', gap: 8}}>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#fef9c3', borderColor: '#eab308'}]} onPress={() => handleStatusChange(issue.id, 'open')}>
                  <Text style={[styles.actionBtnText, {color: '#854d0e', fontSize: 12}]}>OPEN</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#e0f2fe', borderColor: '#0ea5e9'}]} onPress={() => handleStatusChange(issue.id, 'in-progress')}>
                  <Text style={[styles.actionBtnText, {color: '#0369a1', fontSize: 12}]}>PROGRESS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#dcfce7', borderColor: '#22c55e'}]} onPress={() => handleStatusChange(issue.id, 'resolved')}>
                  <Text style={[styles.actionBtnText, {color: '#166534', fontSize: 12}]}>RESOLVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function TeacherDashboard({ navigation }) {
  const [activeTab, setActiveTab] = useState('timetable'); // timetable, attendance, notify
  const [students, setStudents] = useState(Array.from({ length: 10 }, (_, i) => ({ uid: `2024300${String(i + 1).padStart(3, '0')}`, name: `Student ${i + 1}`, attendance: null })));
  
  const [notifyMsg, setNotifyMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const filteredStudents = students.filter(s => s.uid.includes(searchQuery) || s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const handleSelectAllVisible = () => {
    const visibleUids = filteredStudents.map(s => s.uid);
    const allSelected = visibleUids.every(uid => selectedStudents.includes(uid));
    if (allSelected) {
      setSelectedStudents(selectedStudents.filter(uid => !visibleUids.includes(uid)));
    } else {
      setSelectedStudents([...new Set([...selectedStudents, ...visibleUids])]);
    }
  };

  const toggleStudentSelection = (uid) => {
    if (selectedStudents.includes(uid)) {
      setSelectedStudents(selectedStudents.filter(id => id !== uid));
    } else {
      setSelectedStudents([...selectedStudents, uid]);
    }
  };
  
  const timetableData = [
    { id: '1', subject: 'Data Structures', time: '09:00 AM - 10:30 AM', room: 'A-101' },
    { id: '2', subject: 'Web Development', time: '11:00 AM - 12:30 PM', room: 'Lab B-202' },
  ];

  const handleAttendanceToggle = (uid) => {
    setStudents(students.map(s => s.uid === uid ? { ...s, attendance: s.attendance === 'present' ? 'absent' : 'present' } : s));
  };

  const handleMarkAll = (status) => setStudents(students.map(s => ({ ...s, attendance: status })));

  return (
    <>
      <View style={{flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 2, borderBottomColor: '#000', gap: 8}}>
        <TouchableOpacity style={[styles.filterBtn, {flex: 1, alignItems: 'center'}, activeTab === 'timetable' && styles.filterBtnActive]} onPress={() => setActiveTab('timetable')}>
          <Clock size={16} color={activeTab === 'timetable' ? '#fff' : '#000'} />
          <Text style={[styles.filterBtnText, activeTab === 'timetable' && styles.filterBtnTextActive]}>Timetable</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, {flex: 1, alignItems: 'center'}, activeTab === 'attendance' && styles.filterBtnActive]} onPress={() => setActiveTab('attendance')}>
          <Users size={16} color={activeTab === 'attendance' ? '#fff' : '#000'} />
          <Text style={[styles.filterBtnText, activeTab === 'attendance' && styles.filterBtnTextActive]}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, {flex: 1, alignItems: 'center'}, activeTab === 'notify' && styles.filterBtnActive]} onPress={() => setActiveTab('notify')}>
          <Bell size={16} color={activeTab === 'notify' ? '#fff' : '#000'} />
          <Text style={[styles.filterBtnText, activeTab === 'notify' && styles.filterBtnTextActive]}>Notify</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'timetable' && (
          <View>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            {timetableData.map(slot => (
              <View key={slot.id} style={styles.card}>
                <Text style={styles.cardTitle}>{slot.subject}</Text>
                <Text style={styles.cardDesc}>{slot.time}</Text>
                <View style={[styles.statusBadge, {marginTop: 8, backgroundColor: '#fef3c7', borderColor: '#000'}]}>
                  <Text style={[styles.statusBadgeText, {color: '#000'}]}>{slot.room}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'attendance' && (
          <View>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, {backgroundColor: '#dcfce7'}]}><Text style={styles.statLabel}>Present</Text><Text style={[styles.statValue, {color: '#16a34a'}]}>{students.filter(s=>s.attendance==='present').length}</Text></View>
              <View style={[styles.statCard, {backgroundColor: '#fee2e2'}]}><Text style={styles.statLabel}>Absent</Text><Text style={[styles.statValue, {color: '#dc2626'}]}>{students.filter(s=>s.attendance==='absent').length}</Text></View>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#16a34a'}]} onPress={() => handleMarkAll('present')}><Text style={[styles.actionBtnText, {color:'#fff'}]}>All Present</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#dc2626'}]} onPress={() => handleMarkAll('absent')}><Text style={[styles.actionBtnText, {color:'#fff'}]}>All Absent</Text></TouchableOpacity>
            </View>
            <View style={{marginTop: 16, backgroundColor: '#fff', borderWidth: 2, borderColor: '#000'}}>
              {students.map(student => (
                <View key={student.uid} style={{flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', alignItems: 'center'}}>
                  <View>
                    <Text style={{fontWeight: '900', fontSize: 16}}>{student.uid}</Text>
                    <Text style={{fontSize: 12, color: '#6b7280'}}>{student.name}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.filterBtn, student.attendance === 'present' ? {backgroundColor: '#16a34a', borderColor: '#14532d'} : student.attendance === 'absent' ? {backgroundColor: '#dc2626', borderColor: '#7f1d1d'} : {backgroundColor: '#f3f4f6'}]}
                    onPress={() => handleAttendanceToggle(student.uid)}
                  >
                    <Text style={[styles.filterBtnText, student.attendance && {color: '#fff'}]}>{student.attendance === 'present' ? 'Present' : student.attendance === 'absent' ? 'Absent' : 'Mark'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'notify' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Send Notification</Text>
            
            <Text style={{fontSize: 10, fontWeight: '900', color: '#000', marginBottom: 8, marginTop: 4}}>MESSAGE</Text>
            <TextInput 
              style={[styles.inputBox, {minHeight: 100, textAlignVertical: 'top'}]} 
              placeholder="Type your message here..." 
              multiline 
              value={notifyMsg}
              onChangeText={setNotifyMsg}
            />

            <Text style={{fontSize: 10, fontWeight: '900', color: '#000', marginBottom: 8, marginTop: 12}}>
              SELECT STUDENTS ({selectedStudents.length} SELECTED)
            </Text>
            <TextInput 
              style={[styles.inputBox, {paddingVertical: 8, marginBottom: 8}]} 
              placeholder="Search UID..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <TouchableOpacity 
              style={{backgroundColor: '#2563eb', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderWidth: 2, borderColor: '#1d4ed8', marginBottom: 12}}
              onPress={handleSelectAllVisible}
            >
              <Text style={{color: '#fff', fontWeight: '900', fontSize: 12}}>Select All Visible</Text>
            </TouchableOpacity>

            <View style={{height: 200, borderWidth: 2, borderColor: '#000', backgroundColor: '#fef3c7', padding: 12}}>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                {filteredStudents.map(student => (
                  <TouchableOpacity 
                    key={student.uid} 
                    style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#d97706'}}
                    onPress={() => toggleStudentSelection(student.uid)}
                  >
                    <View style={{width: 18, height: 18, borderWidth: 2, borderColor: '#000', marginRight: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: selectedStudents.includes(student.uid) ? '#000' : '#fff'}}>
                      {selectedStudents.includes(student.uid) && <Check size={12} color="#fff" />}
                    </View>
                    <Text style={{fontSize: 14, fontWeight: '700', color: '#000'}}>{student.uid}</Text>
                  </TouchableOpacity>
                ))}
                {filteredStudents.length === 0 && (
                  <Text style={{textAlign: 'center', color: '#92400e', marginTop: 20}}>No students found</Text>
                )}
              </ScrollView>
            </View>

            <TouchableOpacity 
              style={[styles.actionBtn, {backgroundColor: '#000', marginTop: 20}]} 
              onPress={() => {
                if (selectedStudents.length === 0 || !notifyMsg) {
                   Alert.alert('Error', 'Please enter a message and select at least one student.');
                   return;
                }
                Alert.alert('Sent', `Notification sent to ${selectedStudents.length} students!`);
                setNotifyMsg('');
                setSelectedStudents([]);
              }}
            >
              <Bell color="#fff" size={16} />
              <Text style={[styles.actionBtnText, {color: '#fff'}]}>Send Notification</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </>
  );
}

// --- MAIN WRAPPER ---

export default function FacultyPage({ navigation, route }) {
  const { role = 'TEACHER' } = route?.params || {};

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const renderDashboard = () => {
    switch(role.toUpperCase()) {
      case 'HOD': return <HODDashboard navigation={navigation} />;
      case 'HR': return <HRDashboard navigation={navigation} />;
      case 'DEAN': return <DeanDashboard navigation={navigation} />;
      case 'TEACHER':
      default: return <TeacherDashboard navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{role.toUpperCase()} Dashboard</Text>
            <Text style={styles.headerSubtitle}>{role.toLowerCase()}@spit.ac.in</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
              <LogOut size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {renderDashboard()}

        {/* Floating Action Button for Copilot */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('AiCopilot')}
          activeOpacity={0.8}
        >
          <Zap size={24} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
