import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform
} from 'react-native';
import { ArrowLeft, Calendar, FileText, CheckCircle } from 'lucide-react-native';

const LEAVE_TYPES = ['Medical Leave', 'Personal Leave', 'Emergency Leave', 'Academic Leave', 'Other'];

export default function LeaveRequestScreen({ navigation }) {
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!leaveType || !fromDate || !toDate || !reason) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <CheckCircle size={64} color="#16a34a" />
        <Text style={styles.successTitle}>Request Submitted!</Text>
        <Text style={styles.successSubtitle}>
          Your {leaveType} request from {fromDate} to {toDate} has been submitted for approval.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Request</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Leave Type */}
        <View style={styles.section}>
          <Text style={styles.label}>LEAVE TYPE</Text>
          <View style={styles.typeGrid}>
            {LEAVE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, leaveType === type && styles.typeChipActive]}
                onPress={() => setLeaveType(type)}
              >
                <Text style={[styles.typeChipText, leaveType === type && styles.typeChipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>FROM DATE</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={16} color="#6b7280" />
              <TextInput
                style={styles.inputInline}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={fromDate}
                onChangeText={setFromDate}
              />
            </View>
          </View>
          <View style={{ width: 12 }} />
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>TO DATE</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={16} color="#6b7280" />
              <TextInput
                style={styles.inputInline}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={toDate}
                onChangeText={setToDate}
              />
            </View>
          </View>
        </View>

        {/* Reason */}
        <View style={styles.section}>
          <Text style={styles.label}>REASON</Text>
          <View style={styles.textareaWrapper}>
            <FileText size={16} color="#6b7280" style={{ marginBottom: 4 }} />
            <TextInput
              style={styles.textarea}
              placeholder="Describe the reason for your leave..."
              placeholderTextColor="#9ca3af"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.submitBtnText}>Submit Leave Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbeb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  backArrow: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#000' },
  scrollContent: { padding: 16, gap: 20 },
  section: { gap: 8 },
  label: { fontSize: 12, fontWeight: '900', color: '#000', letterSpacing: 1 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    borderWidth: 2, borderColor: '#000',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#fff',
  },
  typeChipActive: { backgroundColor: '#000' },
  typeChipText: { fontWeight: '700', fontSize: 13, color: '#000' },
  typeChipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  inputInline: { flex: 1, fontSize: 14, fontWeight: '500', color: '#000' },
  textareaWrapper: {
    borderWidth: 2, borderColor: '#000',
    backgroundColor: '#fff',
    padding: 10,
  },
  textarea: { fontSize: 14, color: '#000', minHeight: 100 },
  errorBox: {
    backgroundColor: '#fef2f2', borderWidth: 2,
    borderColor: '#f87171', padding: 12,
  },
  errorText: { color: '#7f1d1d', fontWeight: '600', fontSize: 13 },
  submitBtn: {
    backgroundColor: '#000', borderWidth: 2, borderColor: '#000',
    paddingVertical: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    marginBottom: 32,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  successContainer: {
    flex: 1, backgroundColor: '#fffbeb',
    alignItems: 'center', justifyContent: 'center',
    padding: 32, gap: 16,
  },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#000' },
  successSubtitle: { fontSize: 14, color: '#4b5563', textAlign: 'center', lineHeight: 22 },
  backBtn: {
    backgroundColor: '#000', borderWidth: 2, borderColor: '#000',
    paddingHorizontal: 32, paddingVertical: 14, marginTop: 8,
  },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
