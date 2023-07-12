import { Card, Caption, IconButton, Avatar, Title, useTheme } from 'react-native-paper';
import React from 'react';
import { View } from './Themed';
import { StyleSheet } from 'react-native';

type StepCardProps = {
  title: string;
  status: 'completed' | 'pending' | 'error';
};

const StepCard: React.FC<StepCardProps> = ({ title, status }) => {
  let icon;

  const theme = useTheme();


  if (status === 'completed') {
    icon = 'check-circle';
  } else if (status === 'error') {
    icon = 'alert-circle';
  } else {
    icon = 'circle';
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
     
       
        <View style={styles.titleRow}>
        <View style={{...styles.verticalLine, backgroundColor: theme.colors.primary}
        
        } />
        
            <Avatar.Icon icon={icon} size={32}
             
            />
            <Title style={styles.cardTitle}>{title}</Title>
          </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
    card: {
       
        
        borderRadius: 0,
      },
      cardTitle: {
        fontSize: 15,
        marginLeft: 10, // To provide some spacing between the icon and the title
      },
      titleRow: {
        flexDirection: 'row',
        alignItems: 'center', // This aligns the icon and the title vertically
        backgroundColor: 'transparent',
     
      },
      verticalLine: {
        position: 'absolute',
        height: '200%',
        width: 2,
        
        left: 15,
       
      
      },
});

export default StepCard;
