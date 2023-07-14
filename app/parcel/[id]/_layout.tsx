import { Stack } from "expo-router";
import { Button } from "react-native-paper";
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
        

        <Stack.Screen name="index"
        options={
            {   
                title: "Parcel",
                animation: "slide_from_right",
                navigationBarHidden: false,headerBackVisible: true,
                headerLeft: () => {

                    return <Button
                        onPress={() => {
                            console.log("back");
                        } }
                    >Deposit</Button>;
                },
                
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