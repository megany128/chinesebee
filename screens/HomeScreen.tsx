import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, Button, ScrollView } from 'react-native';
import { Text, View } from '../components/Themed';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Feather';
import { RootTabScreenProps } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { db } from '../config/firebase';
import { push, ref, set, onValue } from 'firebase/database';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlipCard from 'react-native-flip-card';

export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
  // initialises current user & auth
  const { user } = useAuthentication();
  const auth = getAuth();

  const [name, setName] = useState(String);
  const [progress, setProgress] = useState(0);

  const [cardsStudied, setCardsStudied] = useState(0)
  const [minutesLearning, setMinutesLearning] = useState(0)
  const [dayStreak, setDayStreak] = useState(0)

  const getStats = async () => {
    let cardsStudiedTemp = parseInt((await AsyncStorage.getItem('cardsStudied')) || '0');
    let minutesLearningTemp = parseInt((await AsyncStorage.getItem('minutesLearning')) || '0');
    let dayStreakTemp = parseInt((await AsyncStorage.getItem('dayStreak')) || '0');
    
    setCardsStudied(cardsStudiedTemp)
    setMinutesLearning(minutesLearningTemp)
    setDayStreak(dayStreakTemp)
  };

  useEffect(() => {
    getStats()
  }, [])

  useEffect(() => {
    console.log('use effect');
    console.log(auth.currentUser?.uid);
    console.log(db);
    return onValue(ref(db, '/students/' + auth.currentUser?.uid), async (querySnapShot) => {
      let data = querySnapShot.val() || [];
      let name = { ...data };
      setName(name.name);
      console.log('name is', data);

      // TODO: generate daily review list here instead

      let dailyStudyProgress = (await AsyncStorage.getItem('dailyStudyProgress')) || '0';
      setProgress(parseFloat(dailyStudyProgress));
    });
  }, []);

  return (
    <LinearGradient colors={['rgba(255,203,68,0.2)', 'rgba(255,255,255,0.3)']} style={styles.container}>
      <SafeAreaView>
        <ScrollView>
          <View style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
            <Text style={styles.greeting}>你好,</Text>
            <Text style={[styles.greeting, { color: '#FFCB44' }]}>{name}</Text>
            <Text style={styles.greeting}>!</Text>
          </View>

          {/* TODO: little bee at end of progress bar */}
          <TouchableOpacity style={styles.todaysRevision} onPress={() => navigation.navigate('DailyStudyScreen')}>
            <Text style={styles.revisionText}>今天的复习</Text>
            <Progress.Bar
              progress={progress}
              height={10}
              width={310}
              color={'#FFE299'}
              borderWidth={0}
              unfilledColor={'white'}
              style={styles.progressBar}
            />
          </TouchableOpacity>

          {/* TODO: fix spacing */}
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              backgroundColor: 'transparent',
              width: 350,
              justifyContent: 'space-between',
            }}
          >
            <FlipCard flipHorizontal={true} flipVertical={false} friction={10}>
              {/* Face Side */}
              <View style={styles.wordOfTheDay}>
                <Text style={styles.wordOfTheDayText}>中文</Text>
              </View>
              {/* Back Side */}
              <View style={styles.wordOfTheDay}>
                <Text style={styles.wordOfTheDayText}>Chinese</Text>
              </View>
            </FlipCard>

            <FlipCard flipHorizontal={true} flipVertical={false} friction={10}>
              {/* Face Side */}
              <View style={styles.wordOfTheDay}>
                <Text style={styles.idiomOfTheDayText}>四脚{'\n'}朝天</Text>
              </View>
              {/* Back Side */}
              <View style={styles.wordOfTheDay}>
                <Text style={styles.idiomOfTheDayText}>Chinese</Text>
              </View>
            </FlipCard>
          </View>

          <TouchableOpacity style={styles.stats}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}
            >
              <View style={{ flexDirection: 'column', backgroundColor: 'transparent', marginRight: 50 }}>
                {/* TODO: customise */}
                <Text style={styles.cardsStudied}>{cardsStudied}</Text>
                <Text style={{ textAlign: 'center', fontWeight: '600' }}>cards{'\n'}studied</Text>
              </View>
              <View style={{ flexDirection: 'column', backgroundColor: 'transparent', marginRight: 50 }}>
                {/* TODO: customise */}
                <Text style={styles.minutesLearning}>{minutesLearning}</Text>
                <Text style={{ textAlign: 'center', fontWeight: '600' }}>minutes{'\n'}learning</Text>
              </View>
              <View style={{ flexDirection: 'column', backgroundColor: 'transparent' }}>
                {/* TODO: customise */}
                <Text style={styles.streak}>{dayStreak}</Text>
                <Text style={{ textAlign: 'center', fontWeight: '600' }}>day{'\n'}streak</Text>
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.quickActionsHeader}>QUICK ACTIONS</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                backgroundColor: '#FFCB44',
                borderRadius: 50,
                marginHorizontal: 10,
              }}
              onPress={() => navigation.navigate('AddScreen')}
            >
              <Icon name="plus" size={60} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                backgroundColor: '#94BAF4',
                borderRadius: 50,
                marginHorizontal: 10,
              }}
              onPress={() => navigation.navigate('StartTestScreen')}
            >
              <Icon2 name="book-open" size={50} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                backgroundColor: '#FEB1C3',
                borderRadius: 50,
                marginHorizontal: 10,
              }}
            >
              <Icon2 name="clock" size={60} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: 'transparent' }}>
            <Button title="Sign Out" onPress={() => signOut(auth)} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    marginVertical: 20,
    marginLeft: 10,
  },
  quickActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  todaysRevision: {
    flexDirection: 'column',
    width: 350,
    height: 120,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 30,
    zIndex: 0,
    backgroundColor: '#FFCB44',
  },
  wordOfTheDay: {
    width: 150,
    height: 150,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  wordOfTheDayText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FEB1C3',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  idiomOfTheDayText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#94BAF4',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  revisionText: {
    fontSize: 40,
    fontWeight: '800',
    color: 'white',
    marginLeft: 20,
    marginTop: 20,
  },
  progressBar: {
    marginLeft: 20,
    marginTop: 15,
  },
  stats: {
    flexDirection: 'column',
    width: 350,
    height: 120,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 30,
    zIndex: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#C4C4C4',
  },
  cardsStudied: {
    color: '#FFCB44',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  minutesLearning: {
    color: '#94BAF4',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  streak: {
    color: '#FEB1C3',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  quickActionsHeader: {
    marginBottom: 30,
    fontWeight: '700',
    fontSize: 20,
  },
});
