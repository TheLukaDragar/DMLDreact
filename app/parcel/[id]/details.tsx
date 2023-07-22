import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Avatar, Button, Caption, Card, ProgressBar, Title } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from '../../../components/Themed';
import { Box, useGetMeQuery, useGetParcelByIdQuery, useLazyGetBoxQuery } from '../../../data/api';

import Constants from 'expo-constants';
import { Linking, ScrollView, StyleSheet } from 'react-native';
import { UserType2 } from '../../../constants/Auth';
import { Dataset, TaskData, getBoxDatasets, getDatasetOrder, getNftDetails, monitorTaskProgress, runApp } from '../../../data/blockchain';
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
  const { data: parcel, error: parcelError, isLoading: parcelLoading } = useGetParcelByIdQuery(parseInt(String(params.id)),
    {
      refetchOnMountOrArgChange: true,
    }

  );
  const { data: user } = useGetMeQuery(undefined, {});

  const [getBox, { data: boxData, error: boxError, isLoading: boxLoading }] = useLazyGetBoxQuery();
  const [boxDetails, setBoxDetails] = useState<Box | undefined>(undefined);
  const [nftDetails, setNftDetails] = useState<{
    parcelId: string, sender: string, receiver: string
  } | undefined>(undefined);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const dispatch = useAppDispatch();



  const [taskInfos, setTaskInfo] = useState<{
    completed: number;
    failed: number;
    timeout: number;
    datasets: Record<string, TaskData>; // object with `dataset_address` as keys
  }>({
    completed: 0,
    failed: 0,
    timeout: 0,
    datasets: {}
  });


  //console.log(parcel);
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
          let dataset_adresses = await dispatch(getBoxDatasets(parcel.nftId)).unwrap();
          console.log(dataset_adresses);


          let datasets: Dataset[] = [];
          //for each dataset, fetch the metadata
          for (let i = 0; i < dataset_adresses.length; i++) {

            try {
              let dataset = await dispatch(getDatasetOrder(dataset_adresses[i])).unwrap();
              console.log(dataset);
              datasets.push(dataset);

            }
            catch (error) {
              console.error('Failed to load box details', error);
            }
          }

          setDatasets(datasets);





        } catch (error) {
          console.error('Failed to load box details', error);
        }
      }
      fetchBlockchainDatasets();



    }


  }, [parcel, getBox]);

  const runTask = async (nftId: string, datasets: Dataset[]) => {
    const datasetTasksDictionary: Record<string, string> = {}; // mapping dataset_address to taskIds

    for (const dataset of datasets) {
      const result = await dispatch(runApp({
        tokenId: nftId,
        dataset: dataset.dataset,
        price: dataset.datasetprice,
      })).unwrap();

      datasetTasksDictionary[dataset.dataset] = result.tasks[0]; // Assuming there is only one task per dataset
    }

    while (true) {
      const taskIds = Object.values(datasetTasksDictionary);
      const { tasksCompleted, tasksFailed, tasksTimeout, tasksData } = await dispatch(
        monitorTaskProgress({ tasks: taskIds })
      ).unwrap();

      const datasetsState = tasksData.reduce((acc, taskData) => {
        const dataset_address = Object.keys(datasetTasksDictionary).find(dataset_address =>
          datasetTasksDictionary[dataset_address] === taskData.taskId
        );

        if (dataset_address) {
          acc[dataset_address] = {
            taskId: taskData.taskId,
            statusName: taskData.statusName,
            taskTimedOut: taskData.taskTimedOut,
            results: taskData.results, // replace this with actual property name for the results
          };
        }
        return acc;
      }, {} as Record<string, TaskData>);

      setTaskInfo(prevState => ({
        completed: tasksCompleted,
        failed: tasksFailed,
        timeout: tasksTimeout,
        datasets: { ...prevState.datasets, ...datasetsState }
      }));

      if (tasksCompleted === taskIds.length || tasksFailed > 0 || tasksTimeout > 0) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  };





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
            <ScrollView style={styles.cardContainer}>
              <Animated.View entering={FadeInUp.duration(1000).springify()}>

                {/* Card with details */}
                <View style={[styles.detailsContainer]}>
                  {/* Card 2: Box Details */}
                  <Card style={styles.card}>
                    <Card.Content>



                      <View style={styles.titleRow}>
                        <Avatar.Icon icon="cube" size={46} />
                        <Title style={styles.cardTitle}>{boxDetails.did}</Title>
                      </View>
                      <Card.Cover source={{ uri: boxDetails.imageUrl }} style={{ marginVertical: 10 }} />

                      {/* Box Details */}
                      <Title style={styles.details}>Vehicle licence plate: <Caption style={styles.details}>{boxDetails.licensePlate}</Caption></Title>

                      {/* Card Actions */}
                      <Card.Actions>
                        {
                          user?.userType === UserType2.RENTER ? (
                            <Button
                              disabled={parcel.depositTime === null || parcel.withdrawTime !== null}
                              mode="contained"
                              icon="car"
                              onPress={() => { router.replace("/parcel/" + parcel.id + "/withdraw"); }}
                            >Access Vehicle</Button>
                          ) : user?.userType === UserType2.PARCEL_DELIVERY ? (
                            <Button
                              mode="contained"
                              icon="car"
                              disabled={parcel.depositTime !== null}
                              onPress={() => { router.replace("/parcel/" + parcel.id + "/deposit"); }}
                            >Access Vehicle</Button>
                          ) : null
                        }
                      </Card.Actions>
                    </Card.Content>
                  </Card>
                  <Card style={styles.card}>
                    <Card.Content>
                      <View style={styles.titleRow}>
                        <Avatar.Icon icon="package-variant-closed" size={46} />
                        <Title style={styles.cardTitle}>{parcel.nftId}</Title>
                      </View>

                      {/* Parcel Details */}
                      <Title style={styles.details}>Tracking Number: <Caption style={styles.details}>{parcel.trackingNumber}</Caption></Title>
                      <Title style={styles.details}>Created: <Caption style={styles.details}>{new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(parcel._createTime))}</Caption></Title>
                      {
                        parcel.depositTime !== null ? (
                          <Title style={styles.details}>Deposit Time: <Caption style={styles.details}>{new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(parcel.depositTime))}</Caption></Title>
                        ) : null
                      }
                      {
                        parcel.withdrawTime !== null ? (
                          <Title style={styles.details}>Withdraw Time: <Caption style={styles.details}>{new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(parcel.withdrawTime))}</Caption></Title>
                        ) : null
                      }
                      <Title style={styles.details}>Courier Wallet Address: <Caption style={styles.details}>{"\n" + nftDetails?.sender}</Caption></Title>
                      <Title style={styles.details}>Recipient Wallet Address: <Caption style={styles.details}>{"\n" + nftDetails?.receiver}</Caption></Title>
                      {/* <Title style={styles.details}>MetaData Datasets: <Caption style={styles.details}>{datasets.length}</Caption></Title> */}
                      {
                        parcel.depositTime !== null ? (
                          <Title style={styles.details}>Status: <Caption style={styles.details}>Delivered</Caption></Title>
                        ) : (
                          <Title style={styles.details}>Status: <Caption style={styles.details}>To be delivered</Caption></Title>
                        )
                      }

                      {/* Card Actions */}
                      <Card.Actions>
                        <Button onPress={() => { Linking.openURL(explorerUrl + "/tx/" + parcel.transactionHash); }}>NFT Details</Button>
                      </Card.Actions>
                    </Card.Content>
                  </Card>
                  <Card style={styles.card}>
                    <Card.Content>
                      <View style={styles.titleRow}>
                        <Avatar.Icon icon="database" size={46} />
                        <Title style={styles.cardTitle}>Audit trail</Title>
                      </View>

                      {/* <Title style={styles.details}>MetaData Datasets: <Caption style={styles.details}>{datasets.length}</Caption></Title> */}
                      {
                        datasets.map((dataset, index) => {
                          // Get task information for this dataset from state
                          const taskInfo = taskInfos.datasets[dataset.dataset]; // Assuming `taskInfos` is a state variable holding the task info

                          return (
                            <Card style={styles.innerCard} key={index}>
                              <Card.Content>
                                <View style={styles.titleRow}>
                                  <Avatar.Icon icon="folder" size={24} />
                                  <Title style={{ ...styles.cardTitle, fontSize: 15 }}>Dataset {index + 1}</Title>
                                </View>
                                <Title style={styles.details}>Dataset Address: <Caption style={styles.details}>{"\n"+dataset.dataset}</Caption></Title>

                                <Title style={styles.details}>{"Created: "}
                                  <Caption style={styles.details}>
                                    {isNaN(Date.parse(dataset.publicationTimestamp)) ? "Invalid date" :
                                      new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                        .format(new Date(dataset.publicationTimestamp))}
                                  </Caption>
                                </Title>

                                {/* Task Status */}
                                {taskInfo && (
                                  <>
                                    <Title style={styles.details}>Status: <Caption style={styles.details}>{taskInfo.statusName}</Caption></Title>

                                    {/* Progress Bar */}
                                    <ProgressBar progress={taskInfo.statusName === 'COMPLETED' ? 1 : 0.5} />
                                  </>
                                )}

                                {/* Dataset specific action */}
                              </Card.Content>
                            </Card>
                          )
                        })
                      }

                      {/* Card Actions */}
                      <Card.Actions>
                        <Button mode="contained"
                          icon="database"
                          onPress={() => { runTask(parcel.nftId, datasets); }}
                        >
                          Download Datasets
                        </Button>
                      </Card.Actions>
                    </Card.Content>
                  </Card>

                </View>




              </Animated.View>
            </ScrollView>
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
    flex: 1,
    margin: 10,

    borderRadius: 8,

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
    flex: 1, // Adjusted to match layout requirement
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
  innerCard: {
    flex: 1,
    margin: 5,
    borderRadius: 8,
  },


});

