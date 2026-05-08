import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { MapPin, Navigation } from 'lucide-react-native';

const BHAVANS_CAMPUS = {
  lat: 19.1136,
  lng: 72.8697,
  name: "Bhavan's Campus",
  address: 'Andheri West, Mumbai'
};

const campusLocations = [
  { id: 1, name: 'Main Canteen', type: 'canteen', lat: 19.1136, lng: 72.8697, description: 'Food and beverage services', timing: '08:00 - 18:00' },
  { id: 2, name: 'Science Lab', type: 'lab', lat: 19.1140, lng: 72.8700, description: 'Advanced research laboratory', timing: '09:00 - 17:00' },
  { id: 3, name: 'Central Library', type: 'library', lat: 19.1132, lng: 72.8695, description: 'Digital and physical resources', timing: '08:00 - 20:00' },
  { id: 4, name: 'Admin Block', type: 'admin', lat: 19.1130, lng: 72.8692, description: 'Administrative offices', timing: '09:00 - 17:30' },
  { id: 5, name: 'Computer Lab', type: 'lab', lat: 19.1138, lng: 72.8705, description: 'Computing facilities', timing: '08:30 - 17:30' },
  { id: 6, name: 'Sports Complex', type: 'sports', lat: 19.1128, lng: 72.8690, description: 'Sports and recreation', timing: '06:00 - 19:00' },
];

const typeColors = {
  canteen: { bg: '#fecaca', text: '#7f1d1d' },
  lab: { bg: '#bfdbfe', text: '#1e3a8a' },
  library: { bg: '#a5f3fc', text: '#164e63' },
  admin: { bg: '#e9d5ff', text: '#581c87' },
  classroom: { bg: '#fef08a', text: '#713f12' },
  sports: { bg: '#bbf7d0', text: '#14532d' },
};

export default function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: BHAVANS_CAMPUS.lat,
          longitude: BHAVANS_CAMPUS.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
      >
        {campusLocations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.lat, longitude: loc.lng }}
            pinColor={selectedLocation === loc.id ? 'black' : 'red'}
            onPress={() => setSelectedLocation(loc.id)}
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{loc.name}</Text>
                <Text style={styles.calloutDesc}>{loc.description}</Text>
                <Text style={styles.calloutTiming}>{loc.timing}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.bottomOverlay}>
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>{BHAVANS_CAMPUS.name}</Text>
          <Text style={styles.headerSubtitle}>{BHAVANS_CAMPUS.address}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScroll}
        >
          {campusLocations.map((loc) => {
            const isSelected = selectedLocation === loc.id;
            const colors = typeColors[loc.type] || { bg: '#e5e7eb', text: '#000' };

            return (
              <TouchableOpacity
                key={loc.id}
                style={[styles.locationCard, isSelected && styles.locationCardSelected]}
                onPress={() => setSelectedLocation(isSelected ? null : loc.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeaderFlex}>
                  <View style={[styles.typeBadge, { backgroundColor: isSelected ? '#000' : colors.bg }]}>
                    <Text style={[styles.typeText, { color: isSelected ? '#fff' : colors.text }]}>{loc.type}</Text>
                  </View>
                  <MapPin size={16} color="#000" />
                </View>
                <Text style={styles.cardTitle}>{loc.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{loc.description}</Text>
                <Text style={styles.cardTiming}>{loc.timing}</Text>

                {isSelected && (
                  <TouchableOpacity style={styles.directionsBtn}>
                    <Navigation size={14} color="#fff" />
                    <Text style={styles.directionsBtnText}>Directions</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  calloutContainer: {
    width: 150,
    padding: 8,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
  },
  calloutDesc: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
  },
  calloutTiming: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 24,
  },
  headerBox: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  headerTitle: {
    fontWeight: '900',
    fontSize: 16,
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4b5563',
  },
  cardsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    width: 200,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  locationCardSelected: {
    backgroundColor: '#fef08a',
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  typeBadge: {
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  cardDesc: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  cardTiming: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  directionsBtn: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 12,
    gap: 6,
  },
  directionsBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  }
});
