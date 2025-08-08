import { Tabs } from 'expo-router';
import { Chrome as Home, LogIn } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#e8eddf',
          borderTopColor: '#242423',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#f5cb5c',
        tabBarInactiveTintColor: '#242423',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Login',
          tabBarIcon: ({ size, color }) => (
            <LogIn size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}