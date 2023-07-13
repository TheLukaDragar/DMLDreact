import { FlatList, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { ActivityIndicator, Avatar, Button, Caption, Card, Divider, Snackbar, Title, useTheme } from 'react-native-paper';
import { Text, View } from '../../components/Themed';
import { useAppDispatch, useAppSelector } from '../../data/hooks';

import * as Location from 'expo-location';
import React, { useEffect } from 'react';
import Toast from 'react-native-root-toast';
import { Box, ParcelData, PreciseLocation, useGetMeQuery, useGetParcelsQuery, useLazyGetBoxQuery } from '../../data/api';

import MapView, { Marker } from 'react-native-maps';

export default function Parcels() {

  const router = useRouter();

  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { data: courier } = useGetMeQuery(undefined, {});

  const { data: parcels, error, isLoading, isFetching, isError } = useGetParcelsQuery(
    {
      courier_id: courier ? courier.id : undefined,
      limit: 5,
      orderBy: "id",
      desc: true,

    }, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });



  const [ErrorMessage, setError] = React.useState("");
  const [location, setLocation] = React.useState<PreciseLocation | null>(null);

  interface BoxData {
    parcel_id: number;
    box: Box;
  }
  const [boxDetails, setBoxDetails] = React.useState<BoxData[]>([]);

  const [getBox, { data: boxData }] = useLazyGetBoxQuery();


  useEffect(() => {
    if (parcels) {
      const fetchBoxDetails = async () => {
        let fetchedDetails = [];
        for (let parcel of parcels) {
          let boxResponse = await getBox(parseInt(parcel.box_id)).unwrap();
          if (boxResponse) { // Check for existence before access
            fetchedDetails.push({ parcel_id: parcel.id, box: boxResponse });
          }
        }
        setBoxDetails(fetchedDetails);
      }
      fetchBoxDetails();
    }
  }, [parcels, getBox]);

  useEffect(() => {
    (async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show('Permission to access location was denied', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
          backgroundColor: theme.colors.error,
        });


        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        inaccuracy: location.coords.accuracy || 0,
      }
      );

    })();
  }, []);

  function distance(loc1: PreciseLocation, loc2: PreciseLocation) {
    const R = 6371e3; // metres
    const φ1 = loc1.latitude * Math.PI / 180; // φ, λ in radians
    const φ2 = loc2.latitude * Math.PI / 180;
    const Δφ = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const Δλ = (loc2.longitude - loc1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres



    return d;
  }

  const renderItem = ({ item }: { item: ParcelData }) => {
    // check if courier reputation is enough to deliver the box
    // const canDeliver = courier ? courier.reputation : 0 >= item.reputationThreshold ? true : false;
    // const canDeliver = true;
    // let distance_to_parcel = "pending"
    // const to_deliver_location = JSON.parse(params.location as string) as PreciseLocation;
    // if( to_deliver_location && item.preciseLocation ){
    //   //round to km and 0 decimal places
    //   distance_to_parcel = Math.round(distance(to_deliver_location, item.preciseLocation) / 1000).toFixed(0) + " km";




    // }

    // Find the location for this parcel
    const box = boxDetails.find((box) => box.parcel_id === item.id);

    // Calculate the distance to the parcel, if a location was found
    let distance_to_parcel = "pending";
    if (box?.box.preciseLocation && location) {
      // Round to km and 0 decimal places
      distance_to_parcel = (Math.round(distance(location, box?.box.preciseLocation) / 1000)).toFixed(0) + " km";
    }




    return (
      <Card key={item.id} style={styles.card}

      >
        <Card.Content>

          <View style={styles.titleRow}>
            <Avatar.Icon icon="package-variant-closed" size={46} />
            <Title style={styles.cardTitle}>{item.nftId}</Title>

          </View>

          <Title style={styles.details}>Tracking Number: <Caption style={styles.details}>{box?.box.licensePlate}</Caption></Title>

          <Divider style={styles.divider} />

          <View style={styles.titleRow}>
            <Avatar.Icon icon="cube" size={46} />
            <Title style={styles.cardTitle}>{box?.box.did}</Title>

          </View>
          <Title style={styles.details}>License Plate: <Caption style={styles.details}>{box?.box.licensePlate}</Caption></Title>
          <Title style={styles.details}>Address: <Caption style={styles.details}>{item.location_id}</Caption></Title>
          <Title style={styles.details}>Distance: <Caption style={styles.details}>{distance_to_parcel}</Caption></Title>

        </Card.Content>
        <Card.Actions>

          <Button
            onPress={() => {
              router.push("/courier/parcel/" + item.id);
            }}
          >Details</Button>

          <Button
            onPress={() => {
              router.push("/courier/parcel/" + item.id);
            }}
          >Deposit</Button>


        </Card.Actions>

      </Card>
    );
  }






  return (
    <View style={styles.container}>
      {
        isLoading || location === null ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text>Loading map...</Text>
          </View>
        ) : (
          <>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location?.latitude || 45.5017,
                longitude: location?.longitude || -73.5673,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              userLocationAnnotationTitle="My Location"
              followsUserLocation={true}
              loadingEnabled={true}
            // showsUserLocation={true} //wait for issue https://github.com/expo/expo/pull/23501 to be merged

            >
              <Marker coordinate={{
                latitude: location?.latitude || 45.5017,
                longitude: location?.longitude || -73.5673,
              }} />
              {boxDetails.map((box) =>
                box.box.preciseLocation && box.box.preciseLocation !== null ? (
                  <Marker
                    key={box.parcel_id}
                    coordinate={{
                      latitude: box.box.preciseLocation.latitude || 0,
                      longitude: box.box.preciseLocation.longitude || 0,
                    }}
                  />
                ) : null
              )}
            </MapView>

            <View style={styles.parcelcontainer}>
              {parcels &&
                <FlatList
                  data={parcels}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => String(item.id) + index}
                />
              }
            </View>
          </>
        )
      }

      <Snackbar
        visible={ErrorMessage != ""}
        onDismiss={() => { setError(""); }}
        action={{
          label: 'Ok',
          onPress: () => {
            setError("");
          },
        }}>
        {ErrorMessage}
      </Snackbar>
    </View>
  );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  card: {
    marginBottom: 10,
    marginHorizontal: 10,

    borderRadius: 5,
  },
  cardTitle: {
    fontSize: 20,
    marginLeft: 10, // To provide some spacing between the icon and the title
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center', // This aligns the icon and the title vertically
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  details: {
    fontSize: 14,
  },
  map: {
    flex: 0.3,

  },
  parcelcontainer: {
    flex: 0.7,
    backgroundColor: 'transparent',
    marginBottom: 10,
    marginTop: 10,
  },
  divider: {
    marginBottom: 10,
  },

});
