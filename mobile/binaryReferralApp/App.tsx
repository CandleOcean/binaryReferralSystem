import React from 'react'
import { SafeAreaView, Text } from 'react-native'
import AppNavigator from './src/navigation/AppNavigator'
import { UserProvider } from './src/context/UserContext'

export default function App() {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  )
}
