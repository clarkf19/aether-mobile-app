import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Modal, Image } from 'react-native';
import { CheckCircle, Users, MapPin, Zap, ChevronRight, X, Download, Send, Edit2, Calendar as CalendarIcon, Clock, ChevronLeft, AlertTriangle, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_ENDPOINTS } from '../apiConfig';

const MOCK_ROOMS = [
  { id: "lab-101a", name: "Lab 101-A", type: "lab", capacity: 30, location: "Tech Building • Ground Floor", color: "#ecfdf5", amenities: ["AC", "Computers", "WiFi"], description: "Standard computer lab for technical sessions.", status: "OPEN", schedule: [ { day: "Monday", busy: [ { start: "10:00", end: "11:00", course: "MDM - Lab" } ] }, { day: "Tuesday", busy: [ { start: "11:15", end: "12:15", course: "DAA/PBB/508" }, { start: "14:15", end: "15:15", course: "MDM I Theory" } ] }, { day: "Wednesday", busy: [ { start: "10:00", end: "11:00", course: "DAA/C/PBB/702-C" }, { start: "11:15", end: "12:15", course: "CCN/AVS/508" } ] }, { day: "Thursday", busy: [ { start: "11:15", end: "12:15", course: "OS/C/SK/608" }, { start: "15:15", end: "16:15", course: "MDM - Lab" } ] }, { day: "Friday", busy: [ { start: "10:00", end: "11:00", course: "CCN/AVS/508" }, { start: "14:15", end: "15:15", course: "OS/SK/508" } ] } ] },
  { id: "lab-101b", name: "Lab 101-B", type: "lab", capacity: 30, location: "Tech Building • Ground Floor", color: "#eff6ff", amenities: ["AC", "Computers", "Projector"], description: "Standard computer lab for technical sessions.", status: "OPEN", schedule: [ { day: "Monday", busy: [ { start: "15:15", end: "16:15", course: "MDM - Lab" } ] }, { day: "Tuesday", busy: [ { start: "12:15", end: "13:15", course: "OS/A/SK/603-7" } ] }, { day: "Wednesday", busy: [ { start: "12:15", end: "13:15", course: "DAA/PBB/508" }, { start: "15:15", end: "16:15", course: "HISS" } ] }, { day: "Thursday", busy: [ { start: "12:15", end: "13:15", course: "DAA/D/NR/603-2" } ] }, { day: "Friday", busy: [ { start: "11:15", end: "12:15", course: "SMCS/TP/508" } ] } ] },
  { id: "classroom-201", name: "Classroom 201", type: "classroom", capacity: 60, location: "Main Building • 2nd Floor", color: "#f5f3ff", amenities: ["AC", "Projector", "WiFi"], description: "Large classroom suitable for standard lectures.", status: "OPEN", schedule: [ { day: "Monday", busy: [ { start: "09:00", end: "10:00", course: "OS/SK/508" } ] }, { day: "Tuesday", busy: [ { start: "09:00", end: "10:00", course: "DAA/PBB/508" }, { start: "14:15", end: "15:15", course: "MDM I Theory" } ] }, { day: "Wednesday", busy: [ { start: "09:00", end: "10:00", course: "OS/B/SK/606-5" }, { start: "13:15", end: "14:15", course: "CCN/AVS/508" } ] }, { day: "Thursday", busy: [ { start: "09:00", end: "10:00", course: "OS/SD/508" }, { start: "14:15", end: "15:15", course: "FOM - II/AsT/207" } ] }, { day: "Friday", busy: [ { start: "09:00", end: "10:00", course: "CCN/AVS/508" } ] } ] },
  { id: "classroom-202", name: "Classroom 202", type: "classroom", capacity: 60, location: "Main Building • 2nd Floor", color: "#ecfeff", amenities: ["AC", "Projector", "Smart Board"], description: "Large classroom suitable for standard lectures.", status: "OPEN", schedule: [ { day: "Monday", busy: [ { start: "11:15", end: "12:15", course: "DAA/PBB/508" } ] }, { day: "Tuesday", busy: [ { start: "13:15", end: "14:15", course: "DAA/B/PBB/702-B" } ] }, { day: "Wednesday", busy: [ { start: "11:15", end: "12:15", course: "DAA/PBB/508" } ] }, { day: "Thursday", busy: [ { start: "10:00", end: "11:00", course: "OS/SD/508" }, { start: "15:15", end: "16:15", course: "SMCS/TP/508" } ] }, { day: "Friday", busy: [ { start: "11:15", end: "12:15", course: "SMCS/TP/508" } ] } ] },
  { id: "classroom-203", name: "Classroom 203", type: "classroom", capacity: 50, location: "Main Building • 2nd Floor", color: "#fff7ed", amenities: ["AC", "Projector", "WiFi"], description: "Medium classroom suitable for interactive sessions.", status: "OPEN", schedule: [ { day: "Monday", busy: [ { start: "12:15", end: "13:15", course: "CCN/AVS/508" } ] }, { day: "Tuesday", busy: [ { start: "10:00", end: "11:00", course: "DAA/C/PBB/702-C" }, { start: "11:15", end: "12:15", course: "CCN/D/AVS/703-A" } ] }, { day: "Wednesday", busy: [ { start: "13:15", end: "14:15", course: "DAA/PBB/508" } ] }, { day: "Thursday", busy: [ { start: "13:15", end: "14:15", course: "CCN/A/AVS/604-4" }, { start: "16:15", end: "17:15", course: "HISS" } ] }, { day: "Friday", busy: [ { start: "13:15", end: "14:15", course: "CCN/B/AVS/607-B" } ] } ] },
];

const normalizeTimeValue = (value) => {
  if (!value) return '';
  const [rawHours = '00', rawMinutes = '00'] = value.split(':');
  const hours = rawHours.padStart(2, '0');
  const minutes = rawMinutes.padStart(2, '0');
  return `${hours}:${minutes}`;
};

const timeToMinutes = (time) => {
  const [hours, minutes] = normalizeTimeValue(time).split(':').map(Number);
  return hours * 60 + minutes;
};

const getOverlappingSlots = (startTime, endTime, bookedSlots) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  return bookedSlots.filter((slot) => {
    const sStart = timeToMinutes(slot.start);
    const sEnd = timeToMinutes(slot.end);
    return startMinutes < sEnd && endMinutes > sStart;
  });
};

export default function ApprovalsScreen({ navigation }) {
  const scrollViewRef = useRef(null);
  const [activeTab, setActiveTab] = useState('certificate');
  
  // Student View State
  const [certificateForm, setCertificateForm] = useState({ type: '', purpose: '', date: '' });
  const [leaveForm, setLeaveForm] = useState({ type: '', reason: '', startDate: '', endDate: '', imageBase64: null });
  const [leaveImageUri, setLeaveImageUri] = useState(null);

  const openGallery = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setLeaveImageUri(pickerResult.assets[0].uri);
      setLeaveForm(prev => ({...prev, imageBase64: pickerResult.assets[0].base64}));
    }
  };

  const openCamera = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setLeaveImageUri(pickerResult.assets[0].uri);
      setLeaveForm(prev => ({...prev, imageBase64: pickerResult.assets[0].base64}));
    }
  };

  const handleImagePick = () => {
    Alert.alert(
      "Attach Medical/Parent Note",
      "Choose photo source",
      [
        { text: "Take Photo (Camera)", onPress: openCamera },
        { text: "Choose from Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };
  
  // Room Booking State
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [bookingForm, setBookingForm] = useState({ date: '', startTime: '', endTime: '', expectedAttendees: '', purpose: '' });
  const [conflictError, setConflictError] = useState(null);
  const [suggestedRooms, setSuggestedRooms] = useState([]);
  
  // Modals & Submissions
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedType, setSubmittedType] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const handleCertificateSubmit = () => {
    if (!certificateForm.type || !certificateForm.purpose || !certificateForm.date) {
      Alert.alert('Error', 'Please fill in all certificate details');
      return;
    }
    setPreviewType('certificate');
    setShowDocumentPreview(true);
  };

  const handleLeaveSubmit = () => {
    if (!leaveForm.type || !leaveForm.reason || !leaveForm.startDate || !leaveForm.endDate) {
      Alert.alert('Error', 'Please fill in all leave details');
      return;
    }
    setPreviewType('leave');
    setShowDocumentPreview(true);
  };

  const handleBookingSubmit = () => {
    setConflictError(null);
    setSuggestedRooms([]);

    if (!bookingForm.date || !bookingForm.startTime || !bookingForm.endTime || !bookingForm.expectedAttendees || !bookingForm.purpose) {
      Alert.alert('Error', 'Please fill in all booking details');
      return;
    }

    const startMinutes = timeToMinutes(bookingForm.startTime);
    const endMinutes = timeToMinutes(bookingForm.endTime);
    if (endMinutes <= startMinutes) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    // Determine Day of Week using local date
    const [y, m, dNum] = bookingForm.date.split('-');
    const d = new Date(y, m - 1, dNum);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[d.getDay()];

    // Find schedule for this day
    const daySchedule = selectedRoomForBooking.schedule?.find(s => s.day === dayOfWeek)?.busy || [];
    
    // Check overlap
    const conflicts = getOverlappingSlots(bookingForm.startTime, bookingForm.endTime, daySchedule);
    
    if (conflicts.length > 0) {
      const formattedSlots = conflicts.map(c => `${c.start}-${c.end} (${c.course})`).join(', ');
      setConflictError(`This room is not available. It overlaps with: ${formattedSlots}`);
      
      // Calculate alternative rooms
      const alternatives = MOCK_ROOMS.filter(r => 
        r.id !== selectedRoomForBooking.id && 
        r.type === selectedRoomForBooking.type && 
        r.capacity >= parseInt(bookingForm.expectedAttendees, 10)
      ).filter(r => {
         const rDaySched = r.schedule?.find(s => s.day === dayOfWeek)?.busy || [];
         const rConflicts = getOverlappingSlots(bookingForm.startTime, bookingForm.endTime, rDaySched);
         return rConflicts.length === 0;
      });

      setSuggestedRooms(alternatives);
      
      // Auto-scroll to the top to see the error box
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
      
      return;
    }

    setPreviewType('room');
    setShowDocumentPreview(true);
  };

  const handleFinalSubmit = async () => {
    try {
      if (previewType === 'room') {
        const response = await fetch(API_ENDPOINTS.rooms, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentEmail: 'student@spit.ac.in',
            studentName: 'Current Student',
            roomId: selectedRoomForBooking.id,
            roomName: selectedRoomForBooking.name,
            date: bookingForm.date,
            startTime: bookingForm.startTime,
            endTime: bookingForm.endTime,
            expectedAttendees: bookingForm.expectedAttendees,
            purpose: bookingForm.purpose,
          })
        });
        const result = await response.json();
        if (!response.ok) {
           if (response.status === 409) {
              setShowDocumentPreview(false);
              setConflictError(result.message || 'Room not available. Someone might have just booked it.');
              setSuggestedRooms(result.suggestedRooms || []);
              setTimeout(() => { scrollViewRef.current?.scrollTo({ y: 0, animated: true }); }, 100);
              return;
           }
           throw new Error(result.error || 'Failed to submit room booking');
        }
      } else if (previewType === 'certificate') {
        const response = await fetch(API_ENDPOINTS.certificates, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentEmail: 'student@spit.ac.in',
            studentName: 'Current Student',
            certificateType: certificateForm.type,
            purpose: certificateForm.purpose,
            dateRequired: certificateForm.date
          })
        });
        if (!response.ok) throw new Error('Failed to submit certificate request');
      } else if (previewType === 'leave') {
        const response = await fetch(API_ENDPOINTS.leaves, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentEmail: 'student@spit.ac.in',
            studentName: 'Current Student',
            leaveType: leaveForm.type,
            reason: leaveForm.reason,
            startDate: leaveForm.startDate,
            endDate: leaveForm.endDate,
            image_base64: leaveForm.imageBase64 ? `data:image/jpeg;base64,${leaveForm.imageBase64}` : null
          })
        });
        if (!response.ok) throw new Error('Failed to submit leave request');
      }

      setShowDocumentPreview(false);
      setSubmittedType(previewType);
      setSubmitted(true);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const renderCalendar = () => {
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const days = Array.from({length: getDaysInMonth(calMonth, calYear)}, (_, i) => i + 1);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const nextMonth = () => {
      if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
      else { setCalMonth(calMonth + 1); }
    };
    const prevMonth = () => {
      if (calYear === today.getFullYear() && calMonth === today.getMonth()) return;
      if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
      else { setCalMonth(calMonth - 1); }
    };

    return (
      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarBox}>
            <View style={styles.calHeader}>
              <Text style={styles.calTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <X size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.calMonthSelector}>
              <TouchableOpacity onPress={prevMonth} style={styles.calArrow}>
                <ChevronLeft size={20} color={calYear === today.getFullYear() && calMonth === today.getMonth() ? "#ccc" : "#000"} />
              </TouchableOpacity>
              <Text style={styles.calMonthText}>{monthNames[calMonth]} {calYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calArrow}>
                <ChevronRight size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.calGrid}>
              {days.map(d => {
                const isPast = calYear === today.getFullYear() && calMonth === today.getMonth() && d < today.getDate();
                return (
                  <TouchableOpacity 
                    key={d} 
                    style={[styles.calDayBtn, isPast && {borderColor: '#f3f4f6', backgroundColor: '#f9fafb'}]}
                    disabled={isPast}
                    onPress={() => {
                      const dateStr = `${calYear}-${(calMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                      setCertificateForm({...certificateForm, date: dateStr});
                      setShowCalendar(false);
                    }}
                  >
                    <Text style={[styles.calDayText, isPast && {color: '#d1d5db'}]}>{d}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const upcomingDates = React.useMemo(() => {
    const dates = [];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      dates.push({
        dayName: dayNames[d.getDay()],
        dateNum: d.getDate(),
        fullDate: `${year}-${month}-${day}`
      });
    }
    return dates;
  }, []);

  const renderSelectedDaySchedule = () => {
    if (!bookingForm.date) return null;
    const [y, m, dNum] = bookingForm.date.split('-');
    const d = new Date(y, m - 1, dNum);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
    const sched = selectedRoomForBooking.schedule?.find(s => s.day === dayOfWeek)?.busy || [];
    
    return (
      <View style={styles.scheduleBox}>
        <Text style={styles.scheduleBoxTitle}><AlertTriangle size={14} color="#a16207" style={{marginRight:4}} /> Existing Schedule for {dayOfWeek}</Text>
        {sched.length > 0 ? sched.map((slot, i) => (
           <Text key={i} style={styles.scheduleSlot}>• {slot.start} - {slot.end} (Class: {slot.course})</Text>
        )) : <Text style={styles.scheduleSlot}>No classes scheduled. Room is free.</Text>}
      </View>
    );
  };

  // SUCCESS SCREEN
  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrapper}>
              <CheckCircle size={48} color="#fff" />
            </View>
            <Text style={styles.successTitle}>
              {submittedType === 'certificate' ? 'Certificate Request Submitted' : 'Booking Requested!'}
            </Text>
            
            <View style={styles.summaryBox}>
              <Text style={styles.summaryBoxTitle}>Request Summary</Text>
              {submittedType === 'certificate' ? (
                <>
                  <Text style={styles.summaryText}>Type: <Text style={styles.summaryBold}>{certificateForm.type}</Text></Text>
                  <Text style={styles.summaryText}>Purpose: <Text style={styles.summaryBold}>{certificateForm.purpose}</Text></Text>
                  <Text style={styles.summaryText}>Date: <Text style={styles.summaryBold}>{certificateForm.date}</Text></Text>
                </>
              ) : (
                <>
                  <Text style={styles.summaryText}>Room: <Text style={styles.summaryBold}>{selectedRoomForBooking?.name}</Text></Text>
                  <Text style={styles.summaryText}>Date: <Text style={styles.summaryBold}>{bookingForm.date}</Text></Text>
                  <Text style={styles.summaryText}>Time: <Text style={styles.summaryBold}>{bookingForm.startTime} - {bookingForm.endTime}</Text></Text>
                  <Text style={styles.summaryText}>Attendees: <Text style={styles.summaryBold}>{bookingForm.expectedAttendees}</Text></Text>
                </>
              )}
            </View>

            <View style={styles.nextStepsBox}>
              <Text style={styles.nextStepsTitle}>Request sent to HOD</Text>
              <Text style={styles.nextStepsText}>You will receive updates via email.</Text>
            </View>

            <TouchableOpacity style={styles.blackBtn} onPress={() => { 
              setSubmitted(false); 
              setCertificateForm({type:'', purpose:'', date:''}); 
              setBookingForm({date:'', startTime:'', endTime:'', expectedAttendees:'', purpose:''});
              setSelectedRoomForBooking(null);
            }}>
              <Text style={styles.blackBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // PREVIEW SCREEN
  if (showDocumentPreview) {
    const isRoom = previewType === 'room';
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.previewHeader}>
          <Text style={styles.headerTitle}>Document Preview</Text>
          <TouchableOpacity onPress={() => setShowDocumentPreview(false)} style={styles.closeBtn}>
            <X size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <Text style={styles.documentInstitute}>BHAVAN'S CAMPUS</Text>
              <Text style={styles.documentLocation}>Andheri West, Mumbai</Text>
            </View>
            
            <Text style={styles.documentTitle}>{isRoom ? 'ROOM BOOKING REQUEST' : 'CERTIFICATE REQUEST'}</Text>
            
            <View style={styles.documentBody}>
              {isRoom ? (
                <>
                  <View style={styles.docRow}><Text style={styles.docLabel}>Room Name:</Text><Text style={styles.docValue}>{selectedRoomForBooking?.name}</Text></View>
                  <View style={styles.docRow}><Text style={styles.docLabel}>Booking Date:</Text><Text style={styles.docValue}>{bookingForm.date}</Text></View>
                  <View style={styles.docRow}><Text style={styles.docLabel}>Time:</Text><Text style={styles.docValue}>{bookingForm.startTime} - {bookingForm.endTime}</Text></View>
                  <View style={styles.docRow}><Text style={styles.docLabel}>Attendees:</Text><Text style={styles.docValue}>{bookingForm.expectedAttendees}</Text></View>
                  <View style={styles.docRow}><Text style={styles.docLabel}>Purpose:</Text><Text style={styles.docValue}>{bookingForm.purpose}</Text></View>
                </>
              ) : previewType === 'certificate' ? (
                <>
                  <View style={styles.docRow}><Text style={styles.docLabel}>Certificate Type:</Text><Text style={styles.docValue}>{certificateForm.type}</Text></View>
                  <View style={styles.docRow}><Text style={styles.docLabel}>Purpose:</Text><Text style={styles.docValue}>{certificateForm.purpose}</Text></View>
                  <View style={styles.docRow}><Text style={styles.docLabel}>Date Required:</Text><Text style={styles.docValue}>{certificateForm.date}</Text></View>
                </>
              ) : (
                <>
                  <View style={styles.docRow}><Text style={styles.docLabel}>Leave Type:</Text><Text style={styles.docValue}>{leaveForm.type}</Text></View>
                  <View style={styles.docRow}><Text style={styles.docLabel}>Reason:</Text><Text style={styles.docValue}>{leaveForm.reason}</Text></View>
                  <View style={styles.docRow}><Text style={styles.docLabel}>Dates:</Text><Text style={styles.docValue}>{leaveForm.startDate} to {leaveForm.endDate}</Text></View>
                </>
              )}
              <View style={styles.docDivider} />
              <View style={styles.docRow}><Text style={styles.docLabel}>Student ID:</Text><Text style={styles.docValue}>BCA-2024-001</Text></View>
              <View style={styles.docRow}><Text style={styles.docLabel}>Student Name:</Text><Text style={styles.docValue}>Anjali Shah</Text></View>
            </View>

            <Text style={styles.docFooter}>This is an automatically generated document from AETHER Campus OS</Text>
          </View>

          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.actionBtnOutline} onPress={() => setShowDocumentPreview(false)}>
              <Edit2 size={18} color="#000" />
              <Text style={styles.actionBtnOutlineText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnOutline} onPress={() => Alert.alert('Downloading PDF...')}>
              <Download size={18} color="#000" />
              <Text style={styles.actionBtnOutlineText}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnBlack} onPress={handleFinalSubmit}>
              <Send size={18} color="#fff" />
              <Text style={styles.actionBtnBlackText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // MAIN SCREEN
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderCalendar()}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Approvals</Text>
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
          <View>
            <View style={styles.tabsRow}>
              <TouchableOpacity style={[styles.tabBtn, activeTab === 'certificate' ? styles.tabBtnActive : null]} onPress={() => setActiveTab('certificate')}>
                <Text style={[styles.tabBtnText, activeTab === 'certificate' ? styles.tabBtnTextActive : null]}>Certificate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, activeTab === 'room' ? styles.tabBtnActive : null]} onPress={() => { setActiveTab('room'); setSelectedRoomForBooking(null); }}>
                <Text style={[styles.tabBtnText, activeTab === 'room' ? styles.tabBtnTextActive : null]}>Room Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, activeTab === 'leave' ? styles.tabBtnActive : null]} onPress={() => setActiveTab('leave')}>
                <Text style={[styles.tabBtnText, activeTab === 'leave' ? styles.tabBtnTextActive : null]}>Leave</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'certificate' ? (
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CERTIFICATE TYPE</Text>
                  <View style={styles.typesGrid}>
                    {['Bonafide Certificate', 'Character Certificate', 'Leaving Certificate', 'No Objection Certificate'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.typeBadge, certificateForm.type === type && styles.typeBadgeActive]}
                        onPress={() => setCertificateForm(prev => ({...prev, type: type}))}
                      >
                        <Text style={[styles.typeText, certificateForm.type === type && styles.typeTextActive]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PURPOSE</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="e.g., Higher Education" 
                    value={certificateForm.purpose}
                    onChangeText={(v) => setCertificateForm(prev => ({...prev, purpose: v}))}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>DATE REQUIRED</Text>
                  <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowCalendar(true)}>
                    <Text style={[styles.datePickerText, !certificateForm.date && {color: '#9ca3af'}]}>
                      {certificateForm.date || 'Select Date'}
                    </Text>
                    <CalendarIcon size={20} color="#000" />
                  </TouchableOpacity>
                  <Text style={{fontSize: 10, color: '#6b7280', marginTop: 4}}>*Only valid dates can be selected via calendar</Text>
                </View>
                <TouchableOpacity style={styles.blackBtn} onPress={handleCertificateSubmit}>
                  <Text style={styles.blackBtnText}>Request Certificate</Text>
                </TouchableOpacity>
              </View>
            ) : activeTab === 'leave' ? (
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>LEAVE TYPE</Text>
                  <View style={styles.typesGrid}>
                    {['Sick Leave', 'Personal Leave', 'On Duty (Event)'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.typeBadge, leaveForm.type === type && styles.typeBadgeActive]}
                        onPress={() => setLeaveForm(prev => ({...prev, type: type}))}
                      >
                        <Text style={[styles.typeText, leaveForm.type === type && styles.typeTextActive]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>REASON</Text>
                  <TextInput 
                    style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
                    placeholder="Detailed reason for leave..." 
                    multiline
                    value={leaveForm.reason}
                    onChangeText={(v) => setLeaveForm(prev => ({...prev, reason: v}))}
                  />
                </View>
                <View style={{flexDirection: 'row', gap: 12}}>
                  <View style={[styles.inputGroup, {flex: 1}]}>
                    <Text style={styles.label}>START DATE</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="YYYY-MM-DD" 
                      value={leaveForm.startDate}
                      onChangeText={(v) => setLeaveForm(prev => ({...prev, startDate: v}))}
                    />
                  </View>
                  <View style={[styles.inputGroup, {flex: 1}]}>
                    <Text style={styles.label}>END DATE</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="YYYY-MM-DD" 
                      value={leaveForm.endDate}
                      onChangeText={(v) => setLeaveForm(prev => ({...prev, endDate: v}))}
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ATTACHMENT (OPTIONAL)</Text>
                  {leaveImageUri ? (
                    <View style={{position: 'relative', marginTop: 8}}>
                      <Image source={{uri: leaveImageUri}} style={{width: 100, height: 100, borderRadius: 8}} />
                      <TouchableOpacity 
                        style={{position: 'absolute', top: -10, left: 85, backgroundColor: '#fff', borderRadius: 12}}
                        onPress={() => {setLeaveImageUri(null); setLeaveForm(prev => ({...prev, imageBase64: null}))}}
                      >
                        <X size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginTop: 8}} onPress={handleImagePick}>
                      <Camera size={20} color="#4b5563" />
                      <Text style={{marginLeft: 8, color: '#4b5563', fontWeight: 'bold'}}>Attach Medical/Parent Note</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity style={styles.blackBtn} onPress={handleLeaveSubmit}>
                  <Text style={styles.blackBtnText}>Submit Leave Request</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // ROOM BOOKING FLOW
              <View>
                {!selectedRoomForBooking ? (
                  <View style={styles.roomsGrid}>
                    {MOCK_ROOMS.map(room => (
                      <View key={room.id} style={styles.rcard}>
                        <View style={[styles.rcardTop, {backgroundColor: room.color}]}>
                           <View style={[styles.rcardStatus, room.status === 'BOOKED' && styles.rcardStatusBooked]}>
                             <Text style={[styles.rcardStatusText, room.status === 'BOOKED' && {color: '#b91c1c'}]}>
                               {room.status === 'OPEN' ? '✓ OPEN' : 'X BOOKED'}
                             </Text>
                           </View>
                        </View>
                        <View style={styles.rcardBottom}>
                          <Text style={styles.rcardTitle}>{room.name}</Text>
                          <Text style={styles.rcardLoc}>{room.location}</Text>
                          <View style={styles.rcardCapRow}>
                            <Users size={12} color="#4b5563" />
                            <Text style={styles.rcardCap}>Capacity: {room.capacity}</Text>
                          </View>
                          
                          <View style={styles.rcardAmenities}>
                            {room.amenities.slice(0,3).map(a => (
                              <View key={a} style={styles.rcardAmenity}><Text style={styles.rcardAmenityText}>{a}</Text></View>
                            ))}
                            {room.amenities.length > 3 && (
                              <View style={styles.rcardAmenity}><Text style={styles.rcardAmenityText}>+{room.amenities.length - 3}</Text></View>
                            )}
                          </View>

                          <TouchableOpacity 
                            style={[styles.rcardBtn, room.status === 'BOOKED' && {opacity: 0.5}]}
                            onPress={() => room.status === 'OPEN' && setSelectedRoomForBooking(room)}
                            disabled={room.status === 'BOOKED'}
                          >
                            <Text style={styles.rcardBtnText}>View Details & Book {'>'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity style={styles.backLink} onPress={() => setSelectedRoomForBooking(null)}>
                      <ChevronLeft size={16} color="#4b5563" />
                      <Text style={styles.backLinkText}>Back to Available Rooms</Text>
                    </TouchableOpacity>

                    {conflictError && (
                      <View style={styles.conflictBox}>
                        <Text style={styles.conflictBoxTitle}>Room Not Available</Text>
                        <Text style={styles.conflictBoxText}>{conflictError}</Text>
                        
                        {suggestedRooms.length > 0 ? (
                          <View style={{marginTop: 12}}>
                            <Text style={styles.conflictBoxTitle}>Available alternatives:</Text>
                            {suggestedRooms.map(room => (
                               <TouchableOpacity key={room.id} style={styles.suggestionBtn} onPress={() => {
                                  setSelectedRoomForBooking(room);
                                  setConflictError(null);
                                  setSuggestedRooms([]);
                               }}>
                                  <View>
                                    <Text style={styles.suggestionName}>{room.name}</Text>
                                    <Text style={styles.suggestionDetail}>{room.type} • Capacity {room.capacity}</Text>
                                  </View>
                                  <Text style={styles.suggestionAction}>Check This Out</Text>
                               </TouchableOpacity>
                            ))}
                          </View>
                        ) : (
                          <Text style={[styles.conflictBoxText, {marginTop: 8}]}>No similar rooms are free for this exact time right now.</Text>
                        )}
                      </View>
                    )}

                    <View style={[styles.detailHeader, {backgroundColor: selectedRoomForBooking.color}]}>
                      <View style={styles.detailHeaderInner}>
                        <View>
                          <Text style={styles.detailTitle}>{selectedRoomForBooking.name}</Text>
                          <Text style={styles.detailLoc}><MapPin size={12} color="#4b5563"/> {selectedRoomForBooking.location}</Text>
                          <Text style={styles.detailCap}><Users size={12} color="#4b5563"/> Capacity: {selectedRoomForBooking.capacity}</Text>
                        </View>
                        <View style={styles.detailStatus}>
                          <Text style={styles.detailStatusText}>• AVAILABLE</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.card}>
                      <Text style={styles.secHeader}>ABOUT</Text>
                      <Text style={styles.secText}>{selectedRoomForBooking.description}</Text>
                      
                      <Text style={[styles.secHeader, {marginTop: 20}]}>AMENITIES</Text>
                      <View style={styles.amenitiesGrid}>
                        {selectedRoomForBooking.amenities.map(a => (
                          <View key={a} style={styles.amenityBox}>
                            <Zap size={14} color="#000" />
                            <Text style={styles.amenityBoxText}>{a}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={[styles.card, {marginTop: 16}]}>
                      <Text style={styles.bookHeader}>Booking Details</Text>
                      
                      <Text style={styles.secHeader}>SELECT DATE</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroller}>
                        {upcomingDates.map(d => (
                          <TouchableOpacity 
                            key={d.fullDate} 
                            style={[styles.dbox, bookingForm.date === d.fullDate && styles.dboxActive]}
                            onPress={() => setBookingForm({...bookingForm, date: d.fullDate})}
                          >
                            <Text style={[styles.dboxDay, bookingForm.date === d.fullDate && {color: '#000'}]}>{d.dayName}</Text>
                            <Text style={[styles.dboxNum, bookingForm.date === d.fullDate && {color: '#000'}]}>{d.dateNum}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      {renderSelectedDaySchedule()}

                      <View style={{flexDirection: 'row', gap: 12, marginTop: 24}}>
                        <View style={{flex: 1}}>
                          <Text style={styles.secHeader}>START TIME</Text>
                          <TextInput 
                            style={styles.input} 
                            placeholder="e.g., 10:00" 
                            value={bookingForm.startTime}
                            onChangeText={(v) => setBookingForm({...bookingForm, startTime: v})}
                          />
                        </View>
                        <View style={{flex: 1}}>
                          <Text style={styles.secHeader}>END TIME</Text>
                          <TextInput 
                            style={styles.input} 
                            placeholder="e.g., 12:00" 
                            value={bookingForm.endTime}
                            onChangeText={(v) => setBookingForm({...bookingForm, endTime: v})}
                          />
                        </View>
                      </View>

                      <Text style={[styles.secHeader, {marginTop: 24}]}>EXPECTED NUMBER OF ATTENDEES</Text>
                      <TextInput 
                        style={styles.input} 
                        placeholder="e.g., 20" 
                        keyboardType="number-pad"
                        value={bookingForm.expectedAttendees}
                        onChangeText={(v) => setBookingForm({...bookingForm, expectedAttendees: v})}
                      />

                      <Text style={[styles.secHeader, {marginTop: 24}]}>PURPOSE</Text>
                      <TextInput 
                        style={[styles.input, styles.purposeInput]}
                        placeholder="e.g., Project Work, Seminar, Study Group"
                        value={bookingForm.purpose}
                        onChangeText={(v) => setBookingForm({...bookingForm, purpose: v})}
                      />

                      <TouchableOpacity style={styles.reviewBtn} onPress={handleBookingSubmit}>
                        <Text style={styles.reviewBtnText}>Review & Submit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fffbeb' },
  header: { padding: 24, paddingTop: Platform.OS === 'android' ? 48 : 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#000' },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 2, borderColor: '#000', backgroundColor: '#fff' },
  toggleBtnActive: { backgroundColor: '#d1fae5' },
  toggleBtnText: { fontWeight: '900', color: '#000', fontSize: 12 },
  toggleBtnTextActive: { color: '#000' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 20, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 16 },
  requestCard: { borderWidth: 2, borderColor: '#000', padding: 16, marginBottom: 12 },
  reqHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reqName: { fontWeight: '900', color: '#000', fontSize: 16 },
  reqEmail: { fontSize: 12, color: '#4b5563' },
  reqBadge: { backgroundColor: '#ffe4e6', paddingHorizontal: 8, paddingVertical: 4 },
  reqBadgeText: { fontSize: 10, fontWeight: '900', color: '#000' },
  reqDetail: { fontSize: 14, color: '#000', marginBottom: 4 },
  reqBold: { fontWeight: '700' },
  reqActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  approveBtn: { flex: 1, backgroundColor: '#22c55e', paddingVertical: 10, borderWidth: 2, borderColor: '#16a34a', alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: '900' },
  rejectBtn: { flex: 1, backgroundColor: '#ef4444', paddingVertical: 10, borderWidth: 2, borderColor: '#dc2626', alignItems: 'center' },
  rejectBtnText: { color: '#fff', fontWeight: '900' },
  tabsRow: { flexDirection: 'row', gap: 12, marginBottom: 16, borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 12, borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#000' },
  tabBtnText: { fontWeight: '900', color: '#000' },
  tabBtnTextActive: { color: '#fff' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '900', color: '#000', marginBottom: 8, textTransform: 'uppercase' },
  input: { borderWidth: 2, borderColor: '#000', padding: 12, fontWeight: '600', color: '#000', backgroundColor: '#fff' },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBadge: { borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12 },
  typeBadgeActive: { backgroundColor: '#000' },
  typeText: { fontWeight: '700', fontSize: 14, color: '#000' },
  typeTextActive: { color: '#fff' },
  datePickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 2, borderColor: '#000', padding: 12, backgroundColor: '#fff' },
  datePickerText: { fontWeight: '600', color: '#000' },
  blackBtn: { backgroundColor: '#000', padding: 16, alignItems: 'center', marginTop: 8 },
  blackBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  calendarBox: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 16, width: '100%', maxWidth: 320, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calTitle: { fontSize: 18, fontWeight: '900', color: '#000' },
  calMonthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 8 },
  calArrow: { padding: 4 },
  calMonthText: { fontSize: 14, fontWeight: '700', color: '#000' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  calDayBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  calDayText: { fontWeight: '600', color: '#000' },

  successContainer: { flex: 1, padding: 16, justifyContent: 'center' },
  successCard: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  successIconWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#000', marginBottom: 24, textAlign: 'center' },
  summaryBox: { backgroundColor: '#eff6ff', borderWidth: 2, borderColor: '#000', padding: 16, width: '100%', marginBottom: 16 },
  summaryBoxTitle: { fontSize: 12, fontWeight: '900', color: '#000', textTransform: 'uppercase', marginBottom: 12 },
  summaryText: { fontSize: 14, color: '#4b5563', marginBottom: 8 },
  summaryBold: { fontWeight: '900', color: '#000' },
  nextStepsBox: { backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#4ade80', padding: 16, width: '100%', marginBottom: 24 },
  nextStepsTitle: { fontWeight: '900', color: '#000' },
  nextStepsText: { fontSize: 14, color: '#4b5563', marginTop: 4 },
  
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: Platform.OS === 'android' ? 48 : 24 },
  closeBtn: { padding: 8, borderWidth: 2, borderColor: '#000', backgroundColor: '#fff' },
  documentCard: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 24, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5, marginBottom: 24, minHeight: 400 },
  documentHeader: { alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 24, marginBottom: 24 },
  documentInstitute: { fontSize: 24, fontWeight: '900', color: '#000' },
  documentLocation: { fontSize: 14, color: '#4b5563' },
  documentTitle: { fontSize: 20, fontWeight: '900', color: '#000', textAlign: 'center', marginBottom: 24 },
  documentBody: { gap: 12 },
  docRow: { flexDirection: 'row', justifyContent: 'space-between' },
  docLabel: { fontWeight: '600', color: '#4b5563' },
  docValue: { fontWeight: '900', color: '#000' },
  docDivider: { borderTopWidth: 2, borderTopColor: '#000', marginVertical: 12 },
  docFooter: { marginTop: 'auto', paddingTop: 24, borderTopWidth: 2, borderTopColor: '#000', fontSize: 10, color: '#6b7280', textAlign: 'center' },
  previewActions: { flexDirection: 'row', gap: 12 },
  actionBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderWidth: 2, borderColor: '#000', backgroundColor: '#fff' },
  actionBtnOutlineText: { fontWeight: '900', color: '#000' },
  actionBtnBlack: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderWidth: 2, borderColor: '#000', backgroundColor: '#000' },
  actionBtnBlackText: { fontWeight: '900', color: '#fff' },

  roomsGrid: { gap: 16 },
  rcard: { borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  rcardTop: { height: 100, borderBottomWidth: 2, borderBottomColor: '#000', justifyContent: 'flex-start', alignItems: 'flex-end', padding: 12 },
  rcardStatus: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#16a34a', paddingHorizontal: 8, paddingVertical: 4 },
  rcardStatusBooked: { borderColor: '#b91c1c' },
  rcardStatusText: { fontSize: 10, fontWeight: '900', color: '#16a34a' },
  rcardBottom: { padding: 16 },
  rcardTitle: { fontSize: 18, fontWeight: '900', color: '#000', marginBottom: 4 },
  rcardLoc: { fontSize: 12, color: '#4b5563', marginBottom: 8 },
  rcardCapRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  rcardCap: { fontSize: 12, fontWeight: '700', color: '#000' },
  rcardAmenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  rcardAmenity: { borderWidth: 1, borderColor: '#000', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#fff' },
  rcardAmenityText: { fontSize: 10, fontWeight: '800', color: '#000' },
  rcardBtn: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 4 },
  rcardBtnText: { fontSize: 14, fontWeight: '900', color: '#000' },

  backLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backLinkText: { fontSize: 14, fontWeight: '700', color: '#4b5563' },
  detailHeader: { borderWidth: 2, borderColor: '#000', padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  detailHeaderInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailTitle: { fontSize: 24, fontWeight: '900', color: '#000', marginBottom: 8 },
  detailLoc: { fontSize: 14, color: '#4b5563', marginBottom: 8 },
  detailCap: { fontSize: 14, fontWeight: '700', color: '#000' },
  detailStatus: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#16a34a', paddingHorizontal: 8, paddingVertical: 4 },
  detailStatusText: { fontSize: 10, fontWeight: '900', color: '#16a34a' },
  secHeader: { fontSize: 12, fontWeight: '900', color: '#4b5563', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
  secText: { fontSize: 14, color: '#000', lineHeight: 20 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityBox: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderColor: '#000', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  amenityBoxText: { fontSize: 12, fontWeight: '800', color: '#000' },
  bookHeader: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 20 },
  dateScroller: { marginBottom: 8 },
  dbox: { width: 64, height: 72, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dboxActive: { borderColor: '#000', backgroundColor: '#fde047' }, 
  dboxDay: { fontSize: 10, fontWeight: '700', color: '#6b7280', marginBottom: 4 },
  dboxNum: { fontSize: 18, fontWeight: '900', color: '#4b5563' },
  
  scheduleBox: { backgroundColor: '#fefce8', borderWidth: 2, borderColor: '#eab308', padding: 12, marginTop: 12 },
  scheduleBoxTitle: { fontSize: 12, fontWeight: '800', color: '#a16207', marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  scheduleSlot: { fontSize: 12, color: '#854d0e', fontWeight: '600', marginBottom: 4 },
  
  conflictBox: { backgroundColor: '#fef2f2', borderWidth: 2, borderColor: '#ef4444', padding: 16, marginBottom: 16 },
  conflictBoxTitle: { fontSize: 14, fontWeight: '900', color: '#991b1b', marginBottom: 4 },
  conflictBoxText: { fontSize: 14, color: '#b91c1c', fontWeight: '600' },
  suggestionBtn: { backgroundColor: '#dcfce3', borderWidth: 2, borderColor: '#4ade80', padding: 12, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suggestionName: { fontWeight: '900', color: '#14532d' },
  suggestionDetail: { fontSize: 10, color: '#166534', textTransform: 'uppercase', fontWeight: '700' },
  suggestionAction: { fontSize: 10, fontWeight: '900', color: '#14532d', textTransform: 'uppercase' },

  purposeInput: { minHeight: 60, textAlignVertical: 'center' },
  reviewBtn: { backgroundColor: '#737373', padding: 16, alignItems: 'center', marginTop: 24, borderWidth: 2, borderColor: '#404040' },
  reviewBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
