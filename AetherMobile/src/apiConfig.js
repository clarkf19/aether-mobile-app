import { Platform } from 'react-native';

// Your computer's local Wi-Fi IP address.
// The Expo server is running on 192.168.100.200 so the Next.js backend uses the same IP.
// If your IP changes, update this value.
const DEV_IP = '192.168.100.199';

export const BASE_URL = `http://${DEV_IP}:3000`;

export const API_ENDPOINTS = {
  issues: `${BASE_URL}/api/report-issue`,
  certificates: `${BASE_URL}/api/requests/certificates`,
  leaves: `${BASE_URL}/api/requests/leaves`,
  rooms: `${BASE_URL}/api/requests/rooms`,
};
