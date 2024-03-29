import { Link, Tabs } from "expo-router";
import { Pressable, useColorScheme } from "react-native";
import Colors from "../../constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme==="dark" ? "dark" : "light"].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        // TODO: Type
        options={{
          title: "Tab One",
          tabBarIcon: ({ color  }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme==="dark" ? "dark" : "light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="TabLog"
        options={{
          title: "log",
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
       <Tabs.Screen
        name="ConnectBox"
        options={{
          title: "ConnectBox",
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="TabTwoScreen"
        options={{
          title: "Tab Two",
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="AddBox"
        options={{
          title: "Add Box",
          tabBarIcon: ({ color }) => <TabBarIcon name="link" color={color} />,
        }}
      />
      <Tabs.Screen
        name="BleScreen"
        options={{
          title: "Add Box",
          tabBarIcon: ({ color }) => <TabBarIcon name="link" color={color} />,
        }}
      />
    </Tabs>
  );
}

//