import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, getErrorMessage, useGetBoxQuery, useGetMeQuery, useLazyGetBoxQuery, useLazyGetMeQuery } from '../../../data/api';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StyleSheet, Image, Dimensions } from 'react-native';
import { Text, View, getTheme } from '../../../components/Themed';
import { Button, Switch, TextInput, Provider, IconButton } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
//import * as ImagePicker from 'expo-image-picker';

export default function KeyBotDetails() {

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id=-1 } = useLocalSearchParams();
  

  const [getBoxDetails,{ isLoading,data,isFetching,isSuccess}] = useLazyGetBoxQuery();
  const [errorMessage, setError] = useState("");
  const [status, setStatus] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const [imageUri, setImageUri] = useState('');
  const theme = getTheme();

  useEffect(() => {
    async function call_GetBoxDetails() {
      try {
        const response = await getBoxDetails(parseInt(String(id))).unwrap();
        setStatus(response.status == 1);
        setLicensePlate(response.licensePlate);
        setImageUri(response.imageUrl  || "https://source.unsplash.com/random");
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    call_GetBoxDetails();
  }, [id]);

  // const pickImage = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.All,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   console.log(result);

  //   if (!result.cancelled) {
  //     setImageUri(result.uri);
  //     // TODO: Make API call to update the image
  //   }
  // };

  const toggleStatus = () => {
    // TODO: Make API call to update the status
    setStatus(!status);
  }

  const handleLicensePlateChange = (value) => {
    // TODO: Make API call to update the licensePlate
    setLicensePlate(value);
  }

 

  return (
    <Provider>
      <View style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
        <Animated.View
          entering={FadeInUp.duration(1000).springify()}
          style={styles.imageContainer}
          
        >
          <Image
            source={{uri: imageUri || 'https://source.unsplash.com/random'}}
            style={styles.image}
          />
          <IconButton
            icon="pencil"
            iconColor='white'
            size={20}
            onPress={
              //pickImage
              () => {}
            }
          />
          <Animated.Text
            entering={FadeInDown.duration(1000).springify()}
            style={styles.overlayText}
          >
            {`KeyBot ID: ${data?.id}`}
          </Animated.Text>
        </Animated.View>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: data?.preciseLocation?.latitude || 45.5017,
            longitude: data?.preciseLocation?.longitude || -73.5673,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          userLocationAnnotationTitle="My Location"
          followsUserLocation={true}
        >
          <Marker coordinate={{
            latitude: data?.preciseLocation?.latitude || 45.5017,
            longitude: data?.preciseLocation?.longitude || -73.5673,
          }} />
        </MapView>
        <View style={{ padding: 24 }}>
          <TextInput
            label="License Plate"
            value={licensePlate}
            onChangeText={handleLicensePlateChange}
          />
          <Switch value={status} onValueChange={toggleStatus} />
          {/* Add more fields as needed */}
        </View>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
 
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: Dimensions.get('window').height * 0.3
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayText: {
    position: 'absolute',
    color: 'white',
    fontSize: 40,
    fontWeight: "800",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    
  },
});