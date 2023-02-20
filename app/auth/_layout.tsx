import { Stack } from "expo-router";

export default function Layout() {
    return <Stack
        screenOptions={
            {
                headerShown: false

            }
        }

        screenListeners={{

        }}



    >
        <Stack.Screen name="index"
            options={{ title: "Welcome" }}
            

        />
        <Stack.Screen name="step_1_create_wallet" 
        options={{ title: "Create Wallet",
        animation : "slide_from_right"

     }}
        
        
        />
        <Stack.Screen name="step_2_write_down_mnemonic"
        options={{ title: "Write Down Mnemonic",
        animation : "slide_from_right"

        }}
        
        
        />
        
        <Stack.Screen name="step_3_choose_role"
        options={{ title: "Choose Role",
        animation : "slide_from_right"

        }}
        
        
        />
        <Stack.Screen name="step_4_client_setup"
        options={{ title: "Client Setup",
        animation : "slide_from_right"

        }}
        
        
        />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
    </Stack>
}