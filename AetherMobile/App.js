import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Map as MapIcon, CreditCard, Calendar, TrendingUp, Zap, CheckSquare } from 'lucide-react-native';

import LoginPage from './src/screens/LoginPage';
import StudentPage from './src/screens/StudentPage';
import MapScreen from './src/screens/MapScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import FacultyPage from './src/screens/FacultyPage';
import LeaveRequestScreen from './src/screens/LeaveRequestScreen';
import ReportIssueScreen from './src/screens/ReportIssueScreen';
import AiCopilotScreen from './src/screens/AiCopilotScreen';
import ApprovalsScreen from './src/screens/ApprovalsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import RoomBookingScreen from './src/screens/RoomBookingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 2,
          borderTopColor: '#000',
          paddingBottom: 32, // massive padding to clear safe area footer
          paddingTop: 8,
          height: 90, // massive height
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontWeight: '900',
          fontSize: 10, // slightly smaller to fit 6 tabs
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={StudentPage} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <MapIcon color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="AI Copilot" 
        component={AiCopilotScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Zap color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Approvals" 
        component={ApprovalsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fffbeb' }
        }}
      >
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Student" component={StudentTabs} />
        <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen} />
        <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
        <Stack.Screen name="AiCopilot" component={AiCopilotScreen} />
        <Stack.Screen name="Faculty" component={FacultyPage} />
        <Stack.Screen name="Approvals" component={ApprovalsScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="RoomBooking" component={RoomBookingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
