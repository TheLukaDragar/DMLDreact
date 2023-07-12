import { StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { Button, Snackbar, TextInput } from 'react-native-paper';
import { Text, View } from '../../components/Themed';
import { useAppDispatch, useAppSelector } from '../../data/hooks';

import React, { useEffect } from 'react';
import { isErrorWithMessage, isFetchBaseQueryError,useGetMeQuery,useGetParcelsQuery,useLazyGetBoxesQuery} from '../../data/api';



export default function Parcels() {

  const router = useRouter();

  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();

  const { data:courier} = useGetMeQuery(undefined, {});

  const { data, error, isLoading, isFetching, isError } = useGetParcelsQuery(
    {
      courier_id: courier ? String(courier.id) : undefined,
    }, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });
  
  const [result, setResult] = React.useState("result");

  const [ErrorMessage, setError] = React.useState("");




  useEffect(() => {

    //console.log(secure.userData);








  }, [])






  return (
    <View style={styles.container}>

      <Text style={styles.title}>Fetch my owned Boxes</Text>
        <Text>
        result:
        {result == null ? "null" : result}

        </Text>


     

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
    alignItems: 'center',
    justifyContent: 'center',
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
});
