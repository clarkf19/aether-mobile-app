import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { ChevronLeft, CheckCircle, Camera, MapPin, AlertTriangle, Droplets, Zap, Wifi, Armchair, HelpCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_ENDPOINTS } from '../apiConfig';

const categories = [
  { id: 'plumbing', label: 'Plumbing', icon: Droplets },
  { id: 'electrical', label: 'Electrical', icon: Zap },
  { id: 'network', label: 'Network', icon: Wifi },
  { id: 'furniture', label: 'Furniture', icon: Armchair },
  { id: 'other', label: 'Other', icon: HelpCircle },
];

const nearbyIssues = [
  { location: 'Block C', issue: 'Water Leak', reports: 4, severity: 'high' },
  { location: 'Library', issue: 'WiFi Issue', reports: 6, severity: 'medium' },
  { location: 'Lab A-203', issue: 'AC Not Working', reports: 3, severity: 'low' },
];

export default function ReportIssueScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ description: '', location: '' });
  const [submitted, setSubmitted] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  const openGallery = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setImageUri(pickerResult.assets[0].uri);
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
      quality: 1,
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setImageUri(pickerResult.assets[0].uri);
    }
  };

  const handleImagePick = () => {
    Alert.alert(
      "Attach Photo",
      "Choose photo source",
      [
        { text: "Take Photo (Camera)", onPress: openCamera },
        { text: "Choose from Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !formData.description || !formData.location) {
      alert("Please fill all required fields.");
      return;
    }
    
    try {
      const response = await fetch(API_ENDPOINTS.issues, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: 'student@spit.ac.in', // Mock active user
          student_name: 'Current Student',
          category: selectedCategory,
          description: formData.description,
          location: formData.location,
          image_base64: imageUri ? 'base64_string_mock' : null, // Mocking actual base64 conversion for now
          severity: 'medium'
        })
      });
      
      if (!response.ok) {
        throw new Error('Server returned ' + response.status);
      }
      
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit issue to server.');
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high': return { bg: '#fee2e2', border: '#f87171', text: '#b91c1c' };
      case 'medium': return { bg: '#ffedd5', border: '#fb923c', text: '#c2410c' };
      default: return { bg: '#fef08a', border: '#facc15', text: '#a16207' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerSubtitle}>Hi, Student</Text>
              <Text style={styles.headerTitle}>Report an Issue</Text>
            </View>
          </View>

          {!submitted ? (
            <View style={styles.formContainer}>
              
              <View style={styles.card}>
                <Text style={styles.sectionHeader}>ATTACH PHOTO</Text>
                <TouchableOpacity style={styles.uploadBox} onPress={handleImagePick}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: 120, resizeMode: 'cover' }} />
                  ) : (
                    <>
                      <View style={styles.cameraIconBox}>
                        <Camera size={28} color="#000" />
                      </View>
                      <Text style={styles.uploadTextTitle}>Attach photo</Text>
                      <Text style={styles.uploadTextDesc}>Helps identify issue faster</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionHeader}>ISSUE CATEGORY</Text>
                <View style={styles.categoriesGrid}>
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryBadge, isSelected && styles.categoryBadgeActive]}
                        onPress={() => setSelectedCategory(cat.id)}
                      >
                        <Icon size={16} color={isSelected ? "#000" : "#000"} />
                        <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionHeader}>DESCRIPTION</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the issue in detail..."
                  placeholderTextColor="#9ca3af"
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionHeader}>LOCATION</Text>
                <View style={styles.inputIconWrapper}>
                  <MapPin size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputWithIcon]}
                    placeholder="e.g., Room A-101, Canteen"
                    placeholderTextColor="#9ca3af"
                    value={formData.location}
                    onChangeText={(text) => setFormData({...formData, location: text})}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitBtnText}>Submit Report</Text>
              </TouchableOpacity>

              <View style={styles.card}>
                <View style={styles.hotspotsHeader}>
                  <AlertTriangle size={16} color="#f97316" />
                  <Text style={styles.sectionHeader}>NEARBY ISSUES / HOTSPOTS</Text>
                </View>
                
                <View style={styles.hotspotsList}>
                  {nearbyIssues.map((item, index) => {
                    const sStyle = getSeverityStyle(item.severity);
                    return (
                      <View key={index} style={[styles.hotspotItem, { backgroundColor: sStyle.bg, borderLeftColor: sStyle.border }]}>
                        <View style={styles.hotspotLeft}>
                          <MapPin size={16} color="#000" />
                          <View>
                            <Text style={styles.hotspotLoc}>{item.location}</Text>
                            <Text style={styles.hotspotIssue}>{item.issue}</Text>
                          </View>
                        </View>
                        <View style={styles.hotspotReports}>
                          <Text style={styles.hotspotReportsText}>{item.reports} reports</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

            </View>
          ) : (
            <View style={[styles.card, styles.centerCard]}>
              <View style={styles.successIconBox}>
                <CheckCircle size={40} color="#22c55e" />
              </View>
              <Text style={styles.successTitle}>Report Submitted</Text>
              <Text style={styles.successDesc}>Your issue has been logged successfully</Text>
              
              <View style={styles.summaryBox}>
                <Text style={styles.summaryHeader}>REPORT SUMMARY</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Category:</Text>
                  <Text style={styles.summaryValue}>{selectedCategory}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Location:</Text>
                  <Text style={styles.summaryValue}>{formData.location}</Text>
                </View>
              </View>

              <View style={styles.alertBox}>
                <Text style={styles.alertTitle}>Report submitted</Text>
                <Text style={styles.alertDesc}>HR will review and take action within 24 hours.</Text>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.submitBtnText}>Back to Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fffbeb' },
  container: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    padding: 8,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4b5563',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
  },
  formContainer: { gap: 16 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    padding: 20,
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
    letterSpacing: 1,
    marginBottom: 12,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#000',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    gap: 8,
  },
  cameraIconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  uploadTextDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoryBadgeActive: {
    backgroundColor: '#22d3ee', // cyan-400
  },
  categoryText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#000',
  },
  categoryTextActive: {
    color: '#000',
  },
  inputIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
  },
  inputWithIcon: {
    paddingLeft: 40,
  },
  input: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 12,
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 120,
  },
  submitBtn: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#000',
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  hotspotsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  hotspotsList: { gap: 12, marginTop: 8 },
  hotspotItem: {
    padding: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotspotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hotspotLoc: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
  },
  hotspotIssue: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.7)',
  },
  hotspotReports: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hotspotReportsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
  },
  centerCard: { alignItems: 'center', textAlign: 'center' },
  successIconBox: {
    width: 80,
    height: 80,
    backgroundColor: '#dcfce3',
    borderWidth: 2,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#000', marginBottom: 4 },
  successDesc: { color: '#4b5563', marginBottom: 24 },
  summaryBox: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#000',
    padding: 16,
    marginBottom: 20,
  },
  summaryHeader: { fontSize: 12, fontWeight: '900', color: '#000', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 8, gap: 12 },
  summaryLabel: { color: '#4b5563', fontWeight: '600', width: 80 },
  summaryValue: { fontWeight: '800', color: '#000', textTransform: 'capitalize' },
  alertBox: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#4ade80',
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  alertTitle: { fontWeight: '800', color: '#166534', marginBottom: 4 },
  alertDesc: { fontSize: 12, color: '#15803d', textAlign: 'center' }
});
