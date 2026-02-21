import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { TreeNode } from '../api/client'
import { getUserTree } from '../api/client'
import { useUser } from '../context/UserContext'

export default function NetworkTreeScreen() {
  const navigation = useNavigation()
  const { user } = useUser()
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [depth, setDepth] = useState(3)

  useEffect(() => {
    if (user) {
      loadTree()
    }
  }, [user, depth])

  const loadTree = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getUserTree(user._id, depth)
      setTree(data)
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load network tree')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} UGX`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759'
      case 'needs_inspection': return '#FF9500'
      case 'suspended': return '#FF3B30'
      default: return '#999'
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading network tree...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Network Tree</Text>
        <View style={styles.depthSelector}>
          {[2, 3, 4].map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.depthButton, depth === d && styles.depthButtonActive]}
              onPress={() => setDepth(d)}
            >
              <Text style={[styles.depthButtonText, depth === d && styles.depthButtonTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scrollView} horizontal>
        <ScrollView style={styles.treeContainer}>
          {tree && <TreeNodeComponent node={tree} formatCurrency={formatCurrency} getStatusColor={getStatusColor} />}
        </ScrollView>
      </ScrollView>
    </View>
  )
}

interface TreeNodeProps {
  node: TreeNode
  formatCurrency: (amount: number) => string
  getStatusColor: (status: string) => string
}

function TreeNodeComponent({ node, formatCurrency, getStatusColor }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <View style={styles.nodeContainer}>
      <TouchableOpacity
        style={styles.node}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.nodeCard, { borderLeftColor: getStatusColor(node.floorStatus) }]}>
          <View style={styles.nodeHeader}>
            <Text style={styles.nodeName}>{node.name}</Text>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(node.floorStatus) }]} />
          </View>
          
          <Text style={styles.nodePhone}>{node.phone}</Text>
          
          <View style={styles.nodeStats}>
            <View style={styles.nodeStat}>
              <Text style={styles.nodeStatLabel}>Earnings</Text>
              <Text style={styles.nodeStatValue}>{formatCurrency(node.totalEarnings)}</Text>
            </View>
            <View style={styles.nodeStat}>
              <Text style={styles.nodeStatLabel}>Floor</Text>
              <Text style={styles.nodeStatValue}>{node.floorSizeSqm} sqm</Text>
            </View>
          </View>

          <View style={styles.nodeLegs}>
            <View style={styles.nodeLeg}>
              <Text style={styles.nodeLegLabel}>Left</Text>
              <Text style={styles.nodeLegValue}>{node.leftLegSqm}</Text>
            </View>
            <View style={styles.nodeLeg}>
              <Text style={styles.nodeLegLabel}>Pairs</Text>
              <Text style={styles.nodeLegValue}>{Math.floor(node.matchedPairsSqm)}</Text>
            </View>
            <View style={styles.nodeLeg}>
              <Text style={styles.nodeLegLabel}>Right</Text>
              <Text style={styles.nodeLegValue}>{node.rightLegSqm}</Text>
            </View>
          </View>

          {node.communityRating > 0 && (
            <Text style={styles.nodeRating}>⭐ {node.communityRating.toFixed(1)}</Text>
          )}
        </View>
      </TouchableOpacity>

      {expanded && (node.leftChild || node.rightChild) && (
        <View style={styles.childrenContainer}>
          <View style={styles.branchContainer}>
            {node.leftChild && (
              <View style={styles.childWrapper}>
                <View style={styles.branchLine} />
                <TreeNodeComponent node={node.leftChild} formatCurrency={formatCurrency} getStatusColor={getStatusColor} />
              </View>
            )}
            {!node.leftChild && (
              <View style={styles.emptySlot}>
                <Text style={styles.emptySlotText}>Empty Slot</Text>
              </View>
            )}
          </View>

          <View style={styles.branchContainer}>
            {node.rightChild && (
              <View style={styles.childWrapper}>
                <View style={styles.branchLine} />
                <TreeNodeComponent node={node.rightChild} formatCurrency={formatCurrency} getStatusColor={getStatusColor} />
              </View>
            )}
            {!node.rightChild && (
              <View style={styles.emptySlot}>
                <Text style={styles.emptySlotText}>Empty Slot</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 16,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  depthSelector: {
    flexDirection: 'row',
  },
  depthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  depthButtonActive: {
    backgroundColor: '#fff',
  },
  depthButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  depthButtonTextActive: {
    color: '#007AFF',
  },
  scrollView: {
    flex: 1,
  },
  treeContainer: {
    flex: 1,
    padding: 16,
  },
  nodeContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  node: {
    marginBottom: 8,
  },
  nodeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nodeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nodePhone: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  nodeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nodeStat: {
    flex: 1,
  },
  nodeStatLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  nodeStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  nodeLegs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nodeLeg: {
    alignItems: 'center',
  },
  nodeLegLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  nodeLegValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  nodeRating: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 8,
    textAlign: 'center',
  },
  childrenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  branchContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  childWrapper: {
    alignItems: 'center',
  },
  branchLine: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    marginBottom: 8,
  },
  emptySlot: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  emptySlotText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
})
