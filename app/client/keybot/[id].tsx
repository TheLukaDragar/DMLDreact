import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Divider, IconButton, Provider, Switch, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, getTheme } from '../../../components/Themed';
import { getErrorMessage, useLazyGetBoxQuery } from '../../../data/api';
import { uploadToFirebase } from "../../../firebaseConfig";

export default function KeyBotDetails() {

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id = -1 } = useLocalSearchParams();


  const [getBoxDetails, { isLoading, data, isFetching, isSuccess }] = useLazyGetBoxQuery();
  const [errorMessage, setError] = useState("");
  const [status, setStatus] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const [imageUri, setImageUri] = useState('');
  const theme = useTheme();
  const [address, setAddress] = useState("");
  const [location, setLocation] = React.useState<LocationObject | null>(null);

  const [permission, requestPermission] = ImagePicker.useCameraPermissions();
  const [files, setFiles] = useState([]);
  const [isUploading, setUploading] = useState(false);

  const handleUploadImage = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!pickerResult.canceled) {
      uploadImageAsync(pickerResult.assets[0].uri, `image_${id}.jpg`);
    }
  };

  const uploadImageAsync = async (uri: string, imageName: string) => {
    setUploading(true);

    try {
      const uploadedImage = await uploadToFirebase(uri, imageName, (progress: any) => {
        console.log(`Upload progress: ${progress}%`);
      });

      setImageUri(uploadedImage.downloadUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }

    setUploading(false);
  };

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
        setImageUri(response.imageUrl || "https://helios-i.mashable.com/imagery/articles/01DbEvTQ6vBPBDhNy2i1dQF/hero-image.fill.size_1248x702.v1635423906.jpg");
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
          <Image source={{ uri: imageUri || 'https://source.unsplash.com/random' }} style={styles.image} />
          <IconButton
            style={{...styles.overlayText,
              backgroundColor: theme.colors.background,  
            }}
            icon="image-edit-outline"
            // iconColor={theme.colors.primary}
            size={32}
            onPress={handleUploadImage}
            disabled={isUploading}
          />

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
    position: 'absolute',
    top: 0,
    right: 0,
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