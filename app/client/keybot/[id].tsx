import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, getErrorMessage, useGetBoxQuery, useGetMeQuery, useLazyGetBoxQuery, useLazyGetMeQuery } from '../../../data/api';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StyleSheet, Image, Dimensions } from 'react-native';
import { Text, View, getTheme } from '../../../components/Themed';
import { Button, Switch, TextInput, Provider, IconButton, Divider } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
//import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';

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
  const [address, setAddress] = useState("");
  const [location, setLocation] = React.useState<LocationObject | null>(null);



  useEffect(() => {
    async function call_GetBoxDetails() {
      try {
        const response = await getBoxDetails(parseInt(String(id))).unwrap();
        setStatus(response.status == 1); //TODO

        const geocodeResult = await Location.reverseGeocodeAsync({
          latitude: response.preciseLocation.latitude,
          longitude: response.preciseLocation.longitude,
        });
  
        if (geocodeResult && geocodeResult.length > 0) {
          const geocodedAddress = geocodeResult[0];
          setAddress(`${geocodedAddress.street}, ${geocodedAddress.city}, ${geocodedAddress.region}, ${geocodedAddress.postalCode}`);
        }

        setLicensePlate(response.licensePlate);
        setImageUri(response.imageUrl  || "https://helios-i.mashable.com/imagery/articles/01DbEvTQ6vBPBDhNy2i1dQF/hero-image.fill.size_1248x702.v1635423906.jpg");
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    (async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');

        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
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
    <View style={styles.container}>
   
      <View style={styles.imageContainer}>
        <Image source={{uri: imageUri || 'https://source.unsplash.com/random'}} style={styles.image} />
       
      </View>

      <Divider style={styles.divider} />

      <Text style={styles.address}>Address: {address == "" ? "Loading..." : address}</Text>

      <MapView
        style={styles.map}
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

      <View style={styles.inputContainer}>
        <TextInput
          label="License Plate"
          value={licensePlate || ""}

          onChangeText={handleLicensePlateChange}
          style={styles.licensePlateInput}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Status:</Text>
          <Switch value={status} onValueChange={toggleStatus} />
        </View>
      </View>
    </View>
  </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: Dimensions.get('window').height * 0.25,
   
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayText: {
   
  },
  map: {
    flex: 0.7,
   
  },
  inputContainer: {
    padding: 20,
  },
  licensePlateInput: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 10,
  },
  divider: {
    marginVertical: 10,
  },
  address: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontStyle: 'italic',
    color: 'gray',
    fontWeight: 'bold',
  },
});