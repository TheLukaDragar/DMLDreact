import { StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { Avatar, Button, Caption, Card, Divider, List, Paragraph, Snackbar, TextInput, Title } from 'react-native-paper';
import { Text, View } from '../../components/Themed';
import { useAppDispatch, useAppSelector } from '../../data/hooks';

import React, { useCallback, useEffect } from 'react';
import { getErrorMessage, isErrorWithMessage, isFetchBaseQueryError,useGetMeQuery,useGetUserDetailsQuery,useLazyGetBoxesQuery, useLazyGetUserDetailsQuery} from '../../data/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import * as Clipboard from 'expo-clipboard';
import { CustomJsonRpcProvider, getBalance, getReputation } from '../../data/blockchain';
import '@ethersproject/shims';

import { ethers } from 'ethers';

function BlockchainBalance({ balance }: { balance: number | null }) {
  let description = "";

  if (balance === null) {
    description = "Loading";
  } else if (balance === -1) {
    description = `Could not retrieve balance`;
  } else {
    description = String(balance) + " xRLC";
  }

  return (
    <List.Item
      title="Balance"
      description={description}
    />
  );
}


function BlockchainReputation({ reputation }: { reputation: number | null }) {
 

    let description = "";

    if (reputation === null) {
      description = "Loading";
    } else if (reputation === -1) {
      description = `Could not retrieve reputation`;
    } else {
      description = String(reputation);
    }

   return  <Paragraph>Reputation: {description}</Paragraph>
  
}





export default function Profile() {

  

  const router = useRouter();

  const secure = useAppSelector((state) => state.secure);
  const blockchain = useAppSelector((state) => state.blockchain);
  const dispatch = useAppDispatch();

  const { data,error , isLoading, isFetching, isError } = useGetMeQuery(undefined,  {
    pollingInterval: 60000,
    refetchOnMountOrArgChange: true,
    skip: false,
  } );

  


  const provider = new CustomJsonRpcProvider({
    url: "https://bellecour.iex.ec",
    headers: {
      "x-api-key": "bellecour",
    }
  });

  const wallet = new ethers.Wallet(secure.keyChainData?.privateKey || '', provider);

  //check if wallet is connected

  


  //check if wallet is connected



  const fetchBlockchainData = useCallback(async () => {
    try {
      await dispatch(getReputation(wallet.address)).unwrap();
      await dispatch(getBalance(wallet.address));
    } catch (error) {
      console.error("Error fetching blockchain data", error);
    }
  }, [wallet.address, dispatch]);

  useEffect(() => {
    fetchBlockchainData();
  }, [fetchBlockchainData]);
 
    if (isError) {  

      return <View style={styles.container}>
      <Text>Error: {getErrorMessage(error)}</Text>
      </View>
    } 
    else if (isLoading) {
     return <View style={styles.container}>
      <Text>Loading...</Text>
      </View>

    
    } else if (isFetching) {
      return  <View style={styles.container}>
        <Text>Updating...</Text>
        </View>

    }
    else if (data) {
      return <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
        
            <Avatar.Text size={64} label={data.authUser.username.charAt(0).toUpperCase()} />
            <Title>{data.authUser.username}</Title>
            <Caption>{data.authUser.email || 'Email not provided'}</Caption>
         

          <Divider style={styles.divider} />

      
            <Paragraph>Status: {data.status}</Paragraph>
            <BlockchainReputation reputation={blockchain.reputation} />
         
       
            <Divider style={styles.divider} />
         

        </Card.Content>
        <Card style={styles.walletCard}>
            
            <Card.Title title="Wallet" />
            <Card.Content>
              <List.Item
                title="Address"
                description={data.crypto[0]?.wallet || 'Not provided'}
                right={(props) => <MaterialCommunityIcons {...props} name="content-copy" />}
                onPress={() => 
                  Clipboard.setStringAsync(data.crypto[0]?.wallet || 'Not provided')
                }



    

               
              />
              <BlockchainBalance balance={blockchain.balance} /> 
              
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" buttonColor='#fcd15a'  textColor='#000000'
              onPress={() => router.push('/wallet')}>View Transactions</Button>
              <Button mode="contained" buttonColor='#fcd15a'  textColor='#000000' onPress={() => router.push('/wallet')}>Export</Button>
            </Card.Actions>
          </Card>
      </Card>
    </View>
     

      
    }
    else {
      return <View style={styles.container}>
      <Text>Something went wrong</Text>
      </View>

    }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    height: '90%',
    elevation: 0,
    shadowColor: 'transparent',
    backgroundColor: 'transparent',
    
  },
  walletCard: {
  
   width: '100%',
   
    shadowColor: 'transparent',
    backgroundColor: 'transparent',
    elevation: 2,
   
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  detailsSection: {
    paddingLeft: 20,
  },
  divider: {
    marginVertical: 10,
  },

});
