import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Avatar, Button, Caption, Card, Divider, Title } from 'react-native-paper';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from '../../components/Themed';
import { Box, useGetParcelByIdQuery, useLazyGetBoxQuery } from '../../data/api';

import Constants from 'expo-constants';
import { Dimensions, Image, Linking, StyleSheet } from 'react-native';


export default function ConnectToTheBox() {

  const explorerUrl = Constants?.expoConfig?.extra?.explorerUrl;

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  console.log(params);


  //useLazyGetParcelByIdQuery
  //useLazyGetParcelByIdQuery
  // useGetParcelByIdQuery
  const { data: parcel, error: parcelError, isLoading: parcelLoading } = useGetParcelByIdQuery(parseInt(String(params.id)));
  const [getBox, { data: boxData, error: boxError, isLoading: boxLoading }] = useLazyGetBoxQuery();
  const [boxDetails, setBoxDetails] = useState<Box | undefined>(undefined);

  console.log(parcel);
  useEffect(() => {
    if (parcel) {
      const fetchBoxDetails = async () => {
        try {
          let boxResponse = await getBox(parseInt(parcel.box_id)).unwrap();
          setBoxDetails(boxResponse);
        } catch (error) {
          console.error('Failed to load box details', error);
        }
      };
      fetchBoxDetails();
    }
  }, [parcel, getBox]);





  return (
    <View style={{
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }}>
      <Animated.View entering={FadeInUp.duration(1000).springify()} style={{ flex: 1 }}>

        {parcelLoading || boxLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          parcel && boxDetails && (
            <Animated.View entering={FadeInUp.duration(1000).springify()} style={{ flex: 1 }}>

              {/* Card with details */}
              <View style={[styles.detailsContainer]}>
                <Card style={styles.card}>
                  <Card.Content>
                    <View style={styles.titleRow}>
                      <Avatar.Icon icon="package-variant-closed" size={46} />
                      <Title style={styles.cardTitle}>{parcel.nftId}</Title>
                    </View>

                    <Title style={styles.details}>Tracking Number: <Caption style={styles.details}>{boxDetails.licensePlate}rr</Caption></Title>

                    <Card.Actions>
                      <Button
                        onPress={() => {
                          Linking.openURL(explorerUrl + "/tx/" + parcel.transactionHash);
                        }}
                      >NFT Details</Button>
                    </Card.Actions>

                    <Divider style={styles.divider} />

                    <View style={styles.titleRow}>
                      <Avatar.Icon icon="cube" size={46} />
                      <Title style={styles.cardTitle}>{boxDetails.did}</Title>
                    </View>
                    <Title style={styles.details}>License Plate: <Caption style={styles.details}>{boxDetails.licensePlate}</Caption></Title>
                    <Title style={styles.details}>Address: <Caption style={styles.details}>{parcel.location_id}</Caption></Title>
                  </Card.Content>
                  <Card.Actions>
                  </Card.Actions>
                </Card>
              </View>

              {/* Image */}
              <View style={[styles.imageContainer]}>
                <Image source={{ uri: boxDetails.imageUrl || 'https://source.unsplash.com/random' }} style={styles.image} />
              </View>

              {/* Additional stuff */}
              <View style={{ flex: 0.2 }}>
                {/* Additional content goes here */}
              </View>

            </Animated.View>
          )
        )}

      </Animated.View>
      {/* Buttons */}
      <View style={{ padding: 24 }}>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={{ alignItems: "center" }}>
          <Button
            mode="contained"
            onPress={() => router.push({
              pathname: "/parcel/deposit",
              params: { id: params.id },
            })}
          >
            Deposit
          </Button>

          <Button
            mode="contained"
            onPress={() => router.push({
              pathname: "/parcel/withdraw",
              params: { id: params.id },
            })}
          >
            Withdraw
          </Button>
        </Animated.View>
      </View>
    </View >
  );
}



const styles = StyleSheet.create({
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
    borderRadius: 0,

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
 
  divider: {
    marginBottom: 10,
  },
  detailsContainer: {
    flex: 0.5, // Adjusted to match layout requirement
    backgroundColor: 'transparent',
  },
  imageContainer: {
    flex: 0.5, // Adjusted to match layout requirement
   
  },
  image: {
    width: '100%',
    height: '100%',
  },


});

