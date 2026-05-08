import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Zap, Send, Sparkles, BookOpen, Calendar, HelpCircle } from 'lucide-react-native';

export default function AiCopilotScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Campus Assistant. I can help you with class schedules, assignments, campus navigation, and more. What would you like to know?" }
  ]);
  const scrollViewRef = useRef(null);

  const quickActions = [
    { icon: Calendar, label: "Today's Schedule", prompt: "What classes do I have today?" },
    { icon: BookOpen, label: "Pending Assignments", prompt: "Show my pending assignments" },
    { icon: HelpCircle, label: "Find a Room", prompt: "Where is room A-203?" },
  ];

  const handleSubmit = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const currentInput = input;
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I understand you're asking about "${currentInput}". As a demo, I can help with schedules, assignments, room locations, and campus services. In a full implementation, I'd provide real-time answers from the campus database.`
      }]);
    }, 1000);
  };

  const handleQuickAction = (prompt) => {
    setInput(prompt);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleBox}>
            <View style={styles.iconBox}>
              <Zap size={24} color="#000" />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Campus Copilot</Text>
              <Text style={styles.headerSubtitle}>Your intelligent campus assistant</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction(action.prompt)}
                >
                  <Icon size={16} color="#000" />
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Chat Messages */}
        <ScrollView 
          style={styles.chatContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <View key={index} style={[styles.messageRow, message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant]}>
              <View style={[styles.messageBubble, message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant]}>
                {message.role === 'assistant' && (
                  <View style={styles.assistantBadge}>
                    <Sparkles size={14} color="#eab308" />
                    <Text style={styles.assistantBadgeText}>AI Assistant</Text>
                  </View>
                )}
                <Text style={message.role === 'user' ? styles.messageTextUser : styles.messageTextAssistant}>
                  {message.content}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Ask me anything about campus..."
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSubmit}>
            <Send size={18} color="#000" />
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fffbeb' },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 4,
    borderBottomColor: '#000',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  headerTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    backgroundColor: '#fde047',
    padding: 8,
    borderWidth: 2,
    borderColor: '#000',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#000' },
  headerSubtitle: { fontSize: 14, color: '#4b5563' },
  quickActionsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  quickActionsScroll: {
    padding: 16,
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  chatContainer: { flex: 1, padding: 16 },
  messageRow: { marginBottom: 16, flexDirection: 'row' },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAssistant: { justifyContent: 'flex-start' },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
  },
  messageBubbleUser: {
    backgroundColor: '#000',
  },
  messageBubbleAssistant: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  assistantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  assistantBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  messageTextUser: {
    fontSize: 14,
    color: '#fff',
  },
  messageTextAssistant: {
    fontSize: 14,
    color: '#000',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 4,
    borderTopColor: '#000',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
  },
  sendBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fde047',
    borderWidth: 2,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendBtnText: {
    fontWeight: '900',
    color: '#000',
    fontSize: 16,
  },
});
