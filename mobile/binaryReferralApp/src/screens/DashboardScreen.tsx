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
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/AppNavigator'
import type { User } from '../api/client'
import { apiGet } from '../api/client'
import { useUser } from '../context/UserContext'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { user: contextUser, setUser, logout } = useUser()
  const [refreshing, setRefreshing] = useState(false)

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
        message: `Join Binary Referral and start earning! Use my referral code: ${contextUser._id}`,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} UGX`
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
        <Text style={styles.earningsLabel}>Total Earnings</Text>
        <Text style={styles.earningsAmount}>{formatCurrency(contextUser.totalEarnings)}</Text>
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

      {/* Network Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Stats</Text>
        
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
          <Text style={styles.referralCode}>{contextUser._id}</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareReferral}>
            <Text style={styles.shareButtonText}>Share Code</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
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
})