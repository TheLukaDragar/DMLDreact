import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Avatar, Button, Caption, Card, Divider, Title } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from '../../../components/Themed';
import { Box, useGetParcelByIdQuery, useLazyGetBoxQuery } from '../../../data/api';

import Constants from 'expo-constants';
import { Linking, StyleSheet } from 'react-native';
import { getBoxDatasets, getNftDetails } from '../../../data/blockchain';
import { useAppDispatch } from '../../../data/hooks';


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
  const [nftDetails, setNftDetails] = useState<{
    parcelId: string, sender: string, receiver: string
  } | undefined>(undefined);
  const [datasets, setDatasets] = useState<string[]>([]);
  const dispatch = useAppDispatch();


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

      const fetchBlockchainDetails = async () => {
        try {
          let blockchainDetails = await dispatch(getNftDetails(parcel.nftId)).unwrap();
          console.log(blockchainDetails);
          setNftDetails(blockchainDetails);
        } catch (error) {
          console.error('Failed to load box details', error);
        }
      }
      fetchBlockchainDetails();

      //fetch fetchBlockchainDatasets

      const fetchBlockchainDatasets = async () => {
        try {
          let blockchainDetails = await dispatch(getBoxDatasets(parcel.nftId)).unwrap();
          console.log(blockchainDetails);
          setDatasets(blockchainDetails);
        } catch (error) {
          console.error('Failed to load box details', error);
        }
      }
      fetchBlockchainDatasets();



    }


  }, [parcel, getBox]);





  return (
    <View style={{
      flex: 1,
      // paddingTop: insets.top,
      // paddingBottom: insets.bottom,
      // paddingLeft: insets.left,
      // paddingRight: insets.right,
    }}>
      <Animated.View entering={FadeInUp.duration(1000).springify()} style={{ flex: 1 }}>

        {parcelLoading || boxLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          parcel && boxDetails && (
            <Animated.View entering={FadeInUp.duration(1000).springify()} style={styles.cardContainer}>

              {/* Card with details */}
              <View style={[styles.detailsContainer]}>
                <Card style={styles.card}>

                  <Card.Content>

                    <View style={styles.titleRow}>
                      <Avatar.Icon icon="package-variant-closed" size={46} />
                      <Title style={styles.cardTitle}>{parcel.nftId}</Title>
                    </View>

                    <Title style={styles.details}>Tracking Number: <Caption style={styles.details}>{parcel.trackingNumber}</Caption></Title>

                    <Title style={styles.details}>Created: <Caption style={styles.details}>{new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(parcel._createTime))}</Caption></Title>

                    <Title style={styles.details}>Courier: <Caption style={styles.details}>{nftDetails?.sender}</Caption></Title>

                    <Title style={styles.details}>Receiver: <Caption style={styles.details}>{nftDetails?.receiver}</Caption></Title>

                    <Title style={styles.details}>MetaData Datasets: <Caption style={styles.details}>{datasets.length}</Caption></Title>

                    <Card.Actions>


                      <Button
                        onPress={() => {
                          Linking.openURL(explorerUrl + "/tx/" + parcel.transactionHash);
                        }}
                      >NFT Details</Button>
                    </Card.Actions>



                    <Divider style={styles.divider} />
                    <Card.Cover source={{ uri: boxDetails.imageUrl }}

                    style={{ marginBottom: 10 }}

                    />
                    <View style={styles.titleRow}>
                      <Avatar.Icon icon="cube" size={46} />
                      <Title style={styles.cardTitle}>{boxDetails.did}</Title>
                    </View>

                    <Title style={styles.details}>License Plate: <Caption style={styles.details}>{boxDetails.licensePlate}</Caption></Title>
                    {/* <Title style={styles.details}>Address: <Caption style={styles.details}>{parcel.location_id}</Caption></Title> */}


                  </Card.Content>
                  <Card.Actions>

                    <Button
                      mode="contained"
                      icon="car"

                      onPress={() => {
                        router.replace("/parcel/" + parcel.id + "/deposit");
                      }}
                    >Access Vehicle
                    </Button>

                  </Card.Actions>
                </Card>
              </View>

              {/* Image */}


            </Animated.View>
          )
        )}

      </Animated.View>

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
    flex: 2, // Adjusted to match layout requirement
  },
  cardContainer: {
    flex: 1, // Adjusted to match layout requirement

  },

  imageContainer: {
    flex: 1, // Adjusted to match layout requirement

  },
  image: {
    flex: 1,

  },


});

