import { Stack } from "expo-router";
export default function Layout() {
    return <Stack
        screenOptions={
            {
                headerShown: true,
                animation: "none",
                headerBackVisible: true,


            }


        }
        screenListeners={{
        }}>
        

        <Stack.Screen name="[id]"
        options={
            {   
                title: "Parcel",
                animation: "slide_from_right",
                navigationBarHidden: false,headerBackVisible: true,
            }
        }

        />

        <Stack.Screen name="deposit"
        options={
            {
                animation: "slide_from_right",
            }
        }

        />

        <Stack.Screen name="withdraw"
        options={
            {
                animation: "slide_from_right",
            }
        }

        />
        
        
    </Stack>
}