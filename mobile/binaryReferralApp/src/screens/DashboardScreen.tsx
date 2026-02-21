import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share,
  Modal,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/AppNavigator'
import type { User, GrowthProjection } from '../api/client'
import { apiGet, getGrowthProjection } from '../api/client'
import { useUser } from '../context/UserContext'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { user: contextUser, setUser, logout } = useUser()
  const [refreshing, setRefreshing] = useState(false)
  const [showProjection, setShowProjection] = useState(false)
  const [projection, setProjection] = useState<any>(null)

  useEffect(() => {
    if (!contextUser) {
      navigation.navigate('Login')
    }
  }, [contextUser])

  const loadUserData = async () => {
    if (!contextUser) return
    try {
      const updatedUser = await apiGet(`/api/users/${contextUser._id}`)
      setUser(updatedUser)
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  const loadProjection = async () => {
    if (!contextUser) return
    try {
      const data = await getGrowthProjection(contextUser._id, 6)
      setProjection(data)
      setShowProjection(true)
    } catch (error) {
      Alert.alert('Error', 'Failed to load projection')
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadUserData()
    setRefreshing(false)
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout()
          navigation.navigate('Login')
        },
      },
    ])
  }

  const handleShareReferral = async () => {
    if (!contextUser) return
    try {
      await Share.share({
        message: `Join EarthEnable Binary Referral and start earning! Clean floors = passive income. Use my referral code: ${contextUser.referralCode}`,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} UGX`
  }

  const getFloorStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759'
      case 'needs_inspection': return '#FF9500'
      case 'suspended': return '#FF3B30'
      default: return '#999'
    }
  }

  const getFloorStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active & Earning'
      case 'needs_inspection': return 'Inspection Due'
      case 'suspended': return 'Suspended'
      default: return status
    }
  }

  if (!contextUser) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  const totalPairs = Math.floor(contextUser.matchedPairsSqm)
  const leftCarry = contextUser.carryLeftSqm
  const rightCarry = contextUser.carryRightSqm

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{contextUser.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Total Earnings Card */}
      <View style={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <View>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsAmount}>{formatCurrency(contextUser.totalEarnings)}</Text>
          </View>
          {!contextUser.earningsEnabled && (
            <View style={styles.suspendedBadge}>
              <Text style={styles.suspendedText}>⚠️ Suspended</Text>
            </View>
          )}
        </View>
        <View style={styles.earningsBreakdown}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Direct Bonus</Text>
            <Text style={styles.breakdownAmount}>{formatCurrency(contextUser.directBonus)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Pair Bonus</Text>
            <Text style={styles.breakdownAmount}>{formatCurrency(contextUser.pairBonus)}</Text>
          </View>
        </View>
      </View>

      {/* Floor Status Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Floor Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getFloorStatusColor(contextUser.floorStatus) }]}>
              <Text style={styles.statusBadgeText}>{getFloorStatusText(contextUser.floorStatus)}</Text>
            </View>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Condition Rating</Text>
            <Text style={styles.statusValue}>{'⭐'.repeat(contextUser.floorConditionRating)}</Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Community Rating</Text>
            <Text style={styles.statusValue}>
              {contextUser.communityRating.toFixed(1)} ⭐ ({contextUser.totalEndorsements} reviews)
            </Text>
          </View>
          
          {contextUser.maintenanceNotes && (
            <View style={styles.maintenanceNote}>
              <Text style={styles.maintenanceNoteText}>{contextUser.maintenanceNotes}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Network Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Network Stats</Text>
          <TouchableOpacity 
            style={styles.viewTreeButton}
            onPress={() => navigation.navigate('NetworkTree')}
          >
            <Text style={styles.viewTreeButtonText}>🌳 View Tree</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalPairs}</Text>
            <Text style={styles.statLabel}>Matched Pairs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{contextUser.floorSizeSqm}</Text>
            <Text style={styles.statLabel}>Your Floor (sqm)</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{contextUser.leftLegSqm}</Text>
            <Text style={styles.statLabel}>Left Leg (sqm)</Text>
            {leftCarry > 0 && (
              <Text style={styles.carryText}>+{leftCarry} carry</Text>
            )}
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{contextUser.rightLegSqm}</Text>
            <Text style={styles.statLabel}>Right Leg (sqm)</Text>
            {rightCarry > 0 && (
              <Text style={styles.carryText}>+{rightCarry} carry</Text>
            )}
          </View>
        </View>
      </View>

      {/* Referral Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grow Your Network</Text>
        <View style={styles.referralCard}>
          <Text style={styles.referralLabel}>Your Referral Code</Text>
          <Text style={styles.referralCode}>{contextUser.referralCode}</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareReferral}>
            <Text style={styles.shareButtonText}>Share Code</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.projectionButton} onPress={loadProjection}>
          <Text style={styles.projectionButtonText}>📊 View 6-Month Projection</Text>
        </TouchableOpacity>
      </View>

      {/* Projection Modal */}
      <Modal visible={showProjection} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Growth Projection</Text>
              <TouchableOpacity onPress={() => setShowProjection(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {projection && (
              <ScrollView style={styles.projectionScroll}>
                <Text style={styles.projectionNote}>
                  Based on 2 direct recruits with average 15 sqm floors
                </Text>
                {projection.projections.map((p: GrowthProjection) => (
                  <View key={p.month} style={styles.projectionRow}>
                    <Text style={styles.projectionMonth}>Month {p.month}</Text>
                    <View style={styles.projectionDetails}>
                      <Text style={styles.projectionText}>New Recruits: {p.newRecruits}</Text>
                      <Text style={styles.projectionText}>New Pairs: {p.newPairs}</Text>
                      <Text style={styles.projectionEarnings}>
                        Earnings: {formatCurrency(p.monthlyEarnings)}
                      </Text>
                      <Text style={styles.projectionCumulative}>
                        Total: {formatCurrency(p.cumulativeEarnings)}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.infoCard}>
          <InfoItem
            title="Direct Bonus"
            description="Earn 250 UGX per sqm for each person you directly recruit"
          />
          <InfoItem
            title="Pair Bonus"
            description="Earn 1,000 UGX per sqm when your left and right legs match"
          />
          <InfoItem
            title="Network Growth"
            description="Everyone in your upline earns from your network's growth"
          />
        </View>
      </View>
    </ScrollView>
  )
}

function InfoItem({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoDescription}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  earningsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: -32,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  suspendedBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  suspendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  earningsBreakdown: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  breakdownItem: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  breakdownAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  viewTreeButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewTreeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  carryText: {
    fontSize: 10,
    color: '#34C759',
    marginTop: 4,
    fontWeight: '600',
  },
  referralCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  referralLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  referralCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: 1,
  },
  shareButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  maintenanceNote: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
  },
  maintenanceNoteText: {
    fontSize: 13,
    color: '#856404',
  },
  projectionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  projectionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalClose: {
    fontSize: 24,
    color: '#999',
  },
  projectionScroll: {
    maxHeight: 400,
  },
  projectionNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  projectionRow: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  projectionMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  projectionDetails: {
    marginTop: 4,
  },
  projectionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  projectionEarnings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginTop: 4,
  },
  projectionCumulative: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 4,
  },
})