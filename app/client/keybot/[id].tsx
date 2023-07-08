import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, getTheme } from '../../../components/Themed';
import { Box, getErrorMessage, useGetBoxQuery, useGetMeQuery, useLazyGetBoxQuery, useLazyGetMeQuery } from '../../../data/api';

export default function KeyBotDetails() {

  const router = useRouter();
  const insets = useSafeAreaInsets();

   // Hooks cannot be called conditionally, so move the condition inside the useEffect
   const { id=-1 } = useLocalSearchParams();
   

   
  const [getBoxDetails,{ isLoading,data,isFetching,isSuccess}] = useLazyGetBoxQuery();
  console.log("KeyBotDetails",id,isLoading,data,isFetching,isSuccess);


  const [ErrorMessage, setError] = React.useState("");

  useEffect(() => {
    async function call_GetBoxDetails() {
      try {
        //wait fpr 3 seconds
      
        const response = await getBoxDetails(parseInt(String(id))).unwrap();
        console.log("call_GetBoxDetails",response);
       
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    call_GetBoxDetails();

  }, [id]);


   

    return (
      <View style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
        <Animated.View
          entering={FadeInUp.duration(1000).springify()}
          style={{ alignItems: "center", flex: 1, justifyContent: "center" }}
        >
          <Text> TODO: Add image here </Text>
        
        </Animated.View>
        <View style={{ padding: 24 }}>
          <Animated.Text
            entering={FadeInDown.duration(1000).springify()}
            style={{
              fontSize: 40, fontWeight: "800", color: getTheme().text
            }}
          >
           
            {data?.id}
          </Animated.Text>
        </View>
      </View>
    );
  }
 


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});
