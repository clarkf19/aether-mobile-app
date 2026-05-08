import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Users, Eye, EyeOff, AlertCircle } from 'lucide-react-native';

export default function LoginPage({ navigation }) {
  const [loginType, setLoginType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const getRoleFromEmail = (emailStr) => {
    const emailLower = emailStr.toLowerCase();
    if (emailLower.includes('hod@spit.ac.in')) return 'HOD';
    if (emailLower.includes('teacher@spit.ac.in')) return 'TEACHER';
    if (emailLower.includes('dean@spit.ac.in')) return 'DEAN';
    if (emailLower.includes('hr@spit.ac.in')) return 'HR';
    return null;
  };

  const handleLogin = () => {
    setError('');

    if (loginType === 'student') {
      if (!uid || !email || !password) {
        setError('Please fill in all fields');
        return;
      }
      navigation.replace('Student');
    } else {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      const role = getRoleFromEmail(email);
      if (!role) {
        setError('Invalid faculty email. Use hod@, teacher@, dean@, or hr@spit.ac.in');
        return;
      }
      // For now we will route all faculty somewhere
      navigation.replace('Faculty', { role: role });
    }
  };

  const isFormValid = () => {
    if (loginType === 'student') return uid && email && password;
    return email && password;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Users size={32} color="#FFF" />
            </View>
            <Text style={styles.title}>AETHER Access</Text>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, loginType === 'student' ? styles.tabActive : styles.tabInactive]}
              onPress={() => { setLoginType('student'); setError(''); }}
            >
              <Text style={loginType === 'student' ? styles.tabTextActive : styles.tabTextInactive}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, loginType === 'faculty' ? styles.tabActive : styles.tabInactive]}
              onPress={() => { setLoginType('faculty'); setError(''); }}
            >
              <Text style={loginType === 'faculty' ? styles.tabTextActive : styles.tabTextInactive}>Faculty</Text>
            </TouchableOpacity>
          </View>

          {!!error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#991b1b" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {loginType === 'faculty' && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                <Text style={{fontWeight: 'bold'}}>Faculty Roles:</Text> hod@spit.ac.in, teacher@spit.ac.in, dean@spit.ac.in, hr@spit.ac.in
              </Text>
            </View>
          )}

          <View style={styles.formContainer}>
            {loginType === 'student' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>UID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your UID"
                  placeholderTextColor="#9ca3af"
                  value={uid}
                  onChangeText={setUid}
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, !isFormValid() && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={!isFormValid()}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {loginType === 'student' ? 'Student Login' : 'Faculty Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb', // amber-50
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#000',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  iconContainer: {
    backgroundColor: '#000',
    borderRadius: 9999,
    padding: 16,
    borderWidth: 2,
    borderColor: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#000',
  },
  tabInactive: {
    backgroundColor: '#fff',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  tabTextInactive: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#f87171',
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#7f1d1d',
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  infoContainer: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#93c5fd',
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    color: '#1e3a8a',
    fontSize: 12,
    fontWeight: '500',
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  input: {
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    padding: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#000',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4, // for android
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
