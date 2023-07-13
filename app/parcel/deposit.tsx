import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, Text, View, getTheme } from '../../components/Themed';
import { INTRO_SCREEN_01 } from '../../constants/Intro';
import ScreenIndicators from '../../components/ScreenIndicators';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, useGetParcelByIdQuery, useLazyGetBoxQuery } from '../../data/api';
import { useEffect, useState } from 'react';


export default function ConnectToTheBox() {


  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  console.log(params);

  //useLazyGetParcelByIdQuery
  const { data:parcel, error, isLoading } = useGetParcelByIdQuery(parseInt(String(params.id)));
  const [getBox, { data: boxData }] = useLazyGetBoxQuery();
  const [boxDetails, setBoxDetails] = useState<Box | undefined>(undefined);


  useEffect(() => {
    if (parcel) {
      const fetchBoxDetails = async () => {
       
       
          let boxResponse = await getBox(parseInt(parcel.box_id)).unwrap();
          
        
        setBoxDetails(boxResponse);
      }
      fetchBoxDetails();
    }
  }, [parcel, getBox]);



  return (
    <View style={{ // Paddings to handle safe area
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right, }}>
      <Animated.View
        entering={FadeInUp.duration(1000).springify()}
        style={{ alignItems: "center", flex: 1, justifyContent: "center" }}
      >
          <Text> TODO: withdraw image here </Text>
        

      </Animated.View>
      <View style={{ padding: 24 }}>
        <Animated.Text
          entering={FadeInDown.duration(1000).springify()}
          style={{
            fontSize: 40, fontWeight: "800", color: getTheme().text
          }}

        >
          {INTRO_SCREEN_01.title}
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(100).duration(1000).springify()}
          style={{
            opacity: 0.5,
            marginTop: 16,
            fontSize: 16,
            color: getTheme().text,
          }}
        >
          {INTRO_SCREEN_01.description}
        </Animated.Text>
        <Animated.View
          entering={FadeInDown.delay(200).duration(1000).springify()}
        >
          <ScreenIndicators count={3} activeIndex={0} />
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(400).duration(1000).springify()}
          style={{ alignItems: "center" }}
        >
          <Button
            mode="contained"

            onPress={() => router.push("/parcel/" + params.id + "/deposit")}
          >
            Next
          </Button>
        </Animated.View>
      </View>
    </View >

  );

}

