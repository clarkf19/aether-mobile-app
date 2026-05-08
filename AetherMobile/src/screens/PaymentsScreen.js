import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, TextInput } from 'react-native';
import { CreditCard, CheckCircle, Smartphone, Lock, Check } from 'lucide-react-native';

const initialDues = [
  { id: 'library', title: 'Library Fine', amount: '500', dueDate: 'Dec 20, 2024', status: 'pending' },
  { id: 'canteen', title: 'Canteen Bill', amount: '250', dueDate: 'Dec 25, 2024', status: 'pending' },
  { id: 'lab', title: 'Lab Fee', amount: '1,500', dueDate: 'Jan 05, 2025', status: 'pending' },
];

export default function PaymentsScreen({ navigation }) {
  const [dues, setDues] = useState(initialDues);
  const [transactions, setTransactions] = useState([]);
  
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showUpiRedirect, setShowUpiRedirect] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pin, setPin] = useState('');

  const handlePayClick = (due) => {
    setSelectedPayment(due);
    setShowMethodModal(true);
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setShowMethodModal(false);

    if (method === 'upi') {
      setShowUpiRedirect(true);
      setTimeout(() => {
        setShowUpiRedirect(false);
        setPin('');
        setShowPinModal(true);
      }, 2000);
    } else {
      setPin('');
      setShowPinModal(true);
    }
  };

  const handlePinConfirm = () => {
    if (pin.length < 4) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPinModal(false);
      
      setDues(dues.map(d => d.id === selectedPayment.id ? { ...d, status: 'paid' } : d));
      
      const txId = `TXN${Date.now()}`;
      setTransactions([{
        id: txId,
        amount: selectedPayment.amount,
        method: selectedMethod === 'upi' ? 'UPI' : 'Card',
        timestamp: new Date().toLocaleString()
      }, ...transactions]);

      setShowSuccessModal(true);
    }, 1500);
  };

  const closeSuccess = () => {
    setShowSuccessModal(false);
    setSelectedPayment(null);
  };

  const totalPending = dues.filter(d => d.status === 'pending').reduce((sum, d) => sum + parseInt(d.amount.replace(/,/g, '')), 0);
  const totalPaid = dues.filter(d => d.status === 'paid').reduce((sum, d) => sum + parseInt(d.amount.replace(/,/g, '')), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Financial Gateway</Text>
          <Text style={styles.headerSubtitle}>Manage your outstanding dues</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: '#fee2e2' }]}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>₹{totalPending.toLocaleString()}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#dcfce3' }]}>
            <Text style={styles.statLabel}>Paid</Text>
            <Text style={styles.statValue}>₹{totalPaid.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>OUTSTANDING DUES</Text>
        
        <View style={styles.duesContainer}>
          {dues.map(due => (
            <View key={due.id} style={styles.dueCard}>
              <View style={styles.dueLeft}>
                <Text style={styles.dueTitle}>{due.title}</Text>
                <Text style={styles.dueDate}>Due: {due.dueDate}</Text>
              </View>
              <View style={styles.dueRight}>
                <Text style={styles.dueAmount}>₹{due.amount}</Text>
                {due.status === 'paid' ? (
                  <View style={styles.paidBadge}>
                    <CheckCircle size={14} color="#166534" />
                    <Text style={styles.paidText}>PAID</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.payButton} 
                    onPress={() => handlePayClick(due)}
                  >
                    <Text style={styles.payButtonText}>PAY</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeader}>RECENT TRANSACTIONS</Text>
        
        <View style={styles.transactionsContainer}>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet.</Text>
          ) : (
            transactions.map(txn => (
              <View key={txn.id} style={styles.txnCard}>
                <View>
                  <Text style={styles.txnAmount}>₹{txn.amount}</Text>
                  <Text style={styles.txnMethod}>{txn.method} • {txn.timestamp}</Text>
                </View>
                <Text style={styles.txnId}>{txn.id}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Select Method Modal */}
      <Modal visible={showMethodModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            <Text style={styles.modalDesc}>Pay ₹{selectedPayment?.amount} for {selectedPayment?.title}</Text>
            
            <TouchableOpacity style={styles.methodBtn} onPress={() => handleMethodSelect('upi')}>
              <Smartphone size={24} color="#000" />
              <View style={{marginLeft: 12}}>
                <Text style={styles.methodTitle}>UPI App</Text>
                <Text style={styles.methodDesc}>GPay, PhonePe, Paytm</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.methodBtn} onPress={() => handleMethodSelect('card')}>
              <CreditCard size={24} color="#000" />
              <View style={{marginLeft: 12}}>
                <Text style={styles.methodTitle}>Credit / Debit Card</Text>
                <Text style={styles.methodDesc}>Visa, Mastercard, RuPay</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowMethodModal(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* UPI Redirect Overlay */}
      {showUpiRedirect && (
        <View style={styles.upiOverlay}>
          <View style={styles.upiBox}>
            <ActivityIndicator size="large" color="#3b82f6" style={{marginBottom: 16}} />
            <Text style={styles.upiTitle}>🔄 Redirecting to UPI</Text>
            <Text style={styles.upiAmount}>₹{selectedPayment?.amount}</Text>
            <Text style={styles.upiDesc}>Opening UPI app (Google Pay, PhonePe, Paytm)</Text>
          </View>
        </View>
      )}

      {/* PIN Confirmation Modal */}
      <Modal visible={showPinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.pinHeader}>
              <Lock size={20} color="#000" />
              <Text style={styles.modalTitle}>Enter PIN</Text>
            </View>
            <Text style={styles.modalDesc}>Confirm payment of ₹{selectedPayment?.amount}</Text>
            
            <TextInput
              style={styles.pinInput}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={pin}
              onChangeText={setPin}
              placeholder="••••"
              placeholderTextColor="#9ca3af"
              editable={!isProcessing}
            />

            {isProcessing ? (
              <View style={styles.processingBtn}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.processingBtnText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.pinActions}>
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]} onPress={() => setShowPinModal(false)}>
                  <Text style={styles.actionBtnOutlineText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.actionBtnBlack, pin.length < 4 && {opacity: 0.5}]} 
                  onPress={handlePinConfirm}
                  disabled={pin.length < 4}
                >
                  <Text style={styles.actionBtnBlackText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { alignItems: 'center' }]}>
            <View style={styles.successIconBox}>
              <Check size={40} color="#fff" />
            </View>
            <Text style={[styles.modalTitle, {marginTop: 16}]}>Payment Successful!</Text>
            <Text style={styles.modalDesc}>₹{selectedPayment?.amount} paid for {selectedPayment?.title}</Text>
            
            <View style={styles.successDetails}>
              <Text style={styles.successLabel}>Transaction ID:</Text>
              <Text style={styles.successValue}>{transactions[0]?.id}</Text>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={closeSuccess}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fffbeb' },
  container: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#000' },
  headerSubtitle: { fontSize: 14, color: '#4b5563' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, borderWidth: 2, borderColor: '#000', padding: 16, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  statLabel: { fontSize: 12, fontWeight: '800', color: '#4b5563', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#000' },
  sectionHeader: { fontSize: 12, fontWeight: '800', color: '#4b5563', letterSpacing: 1, marginBottom: 12 },
  duesContainer: { gap: 12, marginBottom: 24 },
  dueCard: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dueTitle: { fontWeight: '800', fontSize: 16, color: '#000' },
  dueDate: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  dueRight: { alignItems: 'flex-end' },
  dueAmount: { fontSize: 18, fontWeight: '900', color: '#000', marginBottom: 8 },
  payButton: { backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 6 },
  payButtonText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#bbf7d0', borderWidth: 1, borderColor: '#166534', paddingHorizontal: 8, paddingVertical: 4 },
  paidText: { fontSize: 10, fontWeight: '900', color: '#166534' },
  transactionsContainer: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 16 },
  emptyText: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  txnCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  txnAmount: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  txnMethod: { fontSize: 10, color: '#6b7280' },
  txnId: { fontSize: 10, fontWeight: '900', color: '#166534' },
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalBox: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 4 },
  modalDesc: { fontSize: 14, color: '#4b5563', marginBottom: 20 },
  methodBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#000', padding: 16, marginBottom: 12, backgroundColor: '#f9fafb' },
  methodTitle: { fontWeight: '900', color: '#000', fontSize: 16 },
  methodDesc: { fontSize: 12, color: '#6b7280' },
  closeBtn: { marginTop: 12, paddingVertical: 12, alignItems: 'center' },
  closeBtnText: { fontWeight: '700', color: '#4b5563' },
  
  upiOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 16, zIndex: 50 },
  upiBox: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 32, alignItems: 'center', width: '100%', maxWidth: 300 },
  upiTitle: { fontSize: 18, fontWeight: '900', color: '#000', marginBottom: 8 },
  upiAmount: { fontSize: 24, fontWeight: '900', color: '#000', marginBottom: 8 },
  upiDesc: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  
  pinHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  pinInput: { borderWidth: 2, borderColor: '#000', fontSize: 32, fontWeight: '900', textAlign: 'center', letterSpacing: 16, padding: 16, marginBottom: 24, backgroundColor: '#f9fafb' },
  pinActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: '#000' },
  actionBtnOutline: { backgroundColor: '#fff' },
  actionBtnOutlineText: { fontWeight: '900', color: '#000' },
  actionBtnBlack: { backgroundColor: '#000' },
  actionBtnBlackText: { fontWeight: '900', color: '#fff' },
  processingBtn: { backgroundColor: '#000', borderWidth: 2, borderColor: '#000', paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  processingBtnText: { fontWeight: '900', color: '#fff' },
  
  successIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center' },
  successDetails: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#4ade80', padding: 16, width: '100%', marginBottom: 24, marginTop: 12 },
  successLabel: { fontSize: 12, color: '#166534', fontWeight: '700' },
  successValue: { fontSize: 14, fontWeight: '900', color: '#166534' },
  doneBtn: { backgroundColor: '#000', paddingVertical: 16, width: '100%', alignItems: 'center' },
  doneBtnText: { fontWeight: '900', color: '#fff', fontSize: 16 },
});
