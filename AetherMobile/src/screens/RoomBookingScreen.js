import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronLeft, Calendar, Users, DoorOpen, Clock, MapPin, Search } from 'lucide-react-native';

const rooms = [
  { id: '1', name: 'Lab A-201', capacity: 30, features: ['Computers', 'Projector'], type: 'Lab', status: 'available' },
  { id: '2', name: 'Meeting Room C', capacity: 10, features: ['Whiteboard', 'Screen'], type: 'Meeting', status: 'available' },
  { id: '3', name: 'Classroom 405', capacity: 60, features: ['Projector', 'AC'], type: 'Class', status: 'booked' },
  { id: '4', name: 'Seminar Hall', capacity: 120, features: ['Mic System', 'AC'], type: 'Hall', status: 'available' }
];

export default function RoomBookingScreen({ navigation }) {
  const [activeType, setActiveType] = useState('All');
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const types = ['All', 'Lab', 'Meeting', 'Class', 'Hall'];

  const filteredRooms = activeType === 'All' ? rooms : rooms.filter(r => r.type === activeType);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Booking</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6b7280" />
          <Text style={styles.searchText}>Search for rooms, facilities...</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {types.map(type => (
            <TouchableOpacity 
              key={type} 
              style={[styles.tab, activeType === type && styles.tabActive]}
              onPress={() => setActiveType(type)}
            >
              <Text style={[styles.tabText, activeType === type && styles.tabTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>AVAILABLE ROOMS</Text>
        
        {filteredRooms.map(room => (
          <TouchableOpacity 
            key={room.id} 
            style={[styles.roomCard, selectedRoom === room.id && styles.roomCardSelected]}
            onPress={() => setSelectedRoom(room.id)}
            disabled={room.status === 'booked'}
            activeOpacity={0.8}
          >
            <View style={styles.roomHeader}>
              <View>
                <Text style={styles.roomName}>{room.name}</Text>
                <View style={styles.capacityBadge}>
                  <Users size={12} color="#4b5563" />
                  <Text style={styles.capacityText}>Up to {room.capacity}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, room.status === 'booked' ? styles.statusBooked : styles.statusAvailable]}>
                <Text style={[styles.statusText, room.status === 'booked' ? styles.statusTextBooked : styles.statusTextAvailable]}>
                  {room.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.featuresRow}>
              {room.features.map(f => (
                <View key={f} style={styles.featureBadge}>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {selectedRoom && (
        <View style={styles.bottomOverlay}>
          <TouchableOpacity style={styles.bookBtn} onPress={() => {
            alert('Room booked successfully!');
            setSelectedRoom(null);
          }}>
            <Calendar size={20} color="#fff" />
            <Text style={styles.bookBtnText}>Book Room Now</Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fffbeb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    gap: 16,
  },
  backButton: {
    padding: 8,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#f3f4f6',
    padding: 12,
    gap: 8,
  },
  searchText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  tabsContainer: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  tabActive: {
    backgroundColor: '#000',
  },
  tabText: {
    fontWeight: '800',
    color: '#000',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4b5563',
    letterSpacing: 1,
    marginBottom: 12,
  },
  roomCard: {
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
  roomCardSelected: {
    backgroundColor: '#fef08a',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capacityText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  statusBadge: {
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusAvailable: {
    backgroundColor: '#bbf7d0',
  },
  statusBooked: {
    backgroundColor: '#fecaca',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextAvailable: {
    color: '#14532d',
  },
  statusTextBooked: {
    color: '#7f1d1d',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderTopColor: '#000',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  bookBtn: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  }
});
