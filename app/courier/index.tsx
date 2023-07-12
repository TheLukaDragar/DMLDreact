import { FlatList, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { Avatar, Button, Caption, Card, Paragraph, Snackbar, TextInput, Title } from 'react-native-paper';
import { Text, View } from '../../components/Themed';
import { useAppDispatch, useAppSelector } from '../../data/hooks';

import React, { useEffect } from 'react';
import { ParcelData, getErrorMessage, isErrorWithMessage, isFetchBaseQueryError,useGetMeQuery,useGetParcelsQuery,useLazyGetBoxesQuery} from '../../data/api';



export default function Parcels() {

  const router = useRouter();

  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();

  const { data:courier} = useGetMeQuery(undefined, {});

  const { data:parcels, error, isLoading, isFetching, isError } = useGetParcelsQuery(
    {
      courier_id: courier ? courier.id : undefined,
      limit:5,
      orderBy:"id",
      desc:true,

    }, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });
  
  const [result, setResult] = React.useState("result");

  const [ErrorMessage, setError] = React.useState("");




  useEffect(() => {

    //console.log(secure.userData);








  }, [])

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
    


    return (
      <Card key={item.id}  style={styles.card}
      
      >
        <Card.Content>

        <View style={styles.titleRow}>
          <Avatar.Icon icon="package-variant-closed" size={46} />
          <Title style={styles.cardTitle}>{item.nftId}</Title>
        </View>
        <Title style={styles.details}>Receiver: <Caption style={styles.details}>{item.recipient_id}</Caption></Title>
        <Title style={styles.details}>Address: <Caption style={styles.details}>{item.location_id}</Caption></Title>

        
          <Paragraph>Location: {item.location_id}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Caption style={styles.details}>
           test
          </Caption>
          <Button
            onPress={() => {
              router.push("/courier/parcel/" + item.id);
            }}
          >Deliver</Button>


        </Card.Actions>

      </Card>
    );
  }






  return (
    <View style={styles.container}>

      {parcels && 
      <FlatList
      data={parcels}
      renderItem={renderItem}
      keyExtractor={(item, index) => String(item.id) + index}
    /> }





     

      <Snackbar
        visible={ErrorMessage != ""}
        onDismiss={() => { setError(""); }}
        action={{
          label: 'Ok',
          onPress: () => {
            // Do something

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
});
