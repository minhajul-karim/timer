import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  Vibration,
} from 'react-native'
import { Audio } from 'expo-av'

const screen = Dimensions.get('window')
const VIBRATION_PATTERN = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07121B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderWidth: 10,
    borderColor: '#89AADD',
    width: screen.width / 2,
    height: screen.width / 2,
    borderRadius: screen.width / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    fontSize: 45,
    color: '#89AADD',
  },
  stopButton: {
    borderColor: '#FF851B',
  },
  stopButtonText: {
    color: '#FF851B',
  },
  timerText: {
    color: '#fff',
    fontSize: 90,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pikcer: {
    height: 30,
    width: 40,
    ...Platform.select({
      android: {
        color: '#fff',
        backgroundColor: '#1C496D',
        marginHorizontal: 10,
      },
    }),
  },
  inputSeparator: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  input: {
    width: 60,
    padding: 10,
    borderBottomWidth: 3,
    borderColor: '#89AADD',
    color: '#fff',
    fontSize: 30,
  },
})

const formatNumber = (number) => `0${number}`.slice(-2)

const getRemaining = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = time - minutes * 60
  return { minutes: formatNumber(minutes), seconds: formatNumber(seconds) }
}

const generateArray = (number) => {
  const arr = []
  for (let i = 0; i < number; i += 1) {
    arr.push(i.toString())
  }
  return arr
}

export default class App extends Component {
  interval = null

  sound = null

  AVAILABLE_MINUTES = generateArray(60)

  AVAILABLE_SECONDS = generateArray(60)

  constructor(props) {
    super(props)
    this.state = {
      remainingSeconds: 5,
      isTimerRunning: false,
      selectedMinutes: '00',
      selectedSeconds: '00',
    }
    this.playSound = this.playSound.bind(this)
  }

  componentDidMount() {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
    })

    this.sound = new Audio.Sound()

    const status = {
      shouldPlay: false,
    }

    this.sound.loadAsync(
      require('./assets/sounds/notification.mp3'),
      status,
      false
    )
    console.log(this.state.selectedSeconds)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.remainingSeconds === 0 && prevState.remainingSeconds !== 0) {
      this.stop()
      console.log('play sound')
      this.playSound()
      Vibration.vibrate(VIBRATION_PATTERN, false)
      //   Vibration.cancel()
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  start = () => {
    // Input validation
    const IntSelectedMinutes = parseInt(this.state.selectedSeconds, 10)
    const IntSelectedSeconds = parseInt(this.state.selectedMinutes, 10)
    if (
      IntSelectedMinutes >= 0 &&
      IntSelectedMinutes <= 59 &&
      IntSelectedSeconds >= 0 &&
      IntSelectedSeconds <= 59
    ) {
      this.setState((prevState) => ({
        remainingSeconds:
          parseInt(prevState.selectedMinutes, 10) * 60 +
          parseInt(prevState.selectedSeconds, 10),
        isTimerRunning: true,
      }))
      this.interval = setInterval(() => {
        this.setState((prevState) => ({
          remainingSeconds: prevState.remainingSeconds - 1,
          isTimerRunning: true,
        }))
      }, 1000)
    }
  }

  stop = () => {
    clearInterval(this.interval)
    this.interval = null
    this.setState({
      remainingSeconds: 5,
      isTimerRunning: false,
    })
  }

  playSound() {
    this.sound.setPositionAsync(0).then(() => {
      this.sound.playAsync()
    })
  }

  renderPickers = () => {
    return (
      <View style={styles.inputContainer}>
        <TextInput
          value={this.state.selectedMinutes}
          style={styles.input}
          keyboardType="number-pad"
          onChangeText={(value) => {
            if (value >= 0 && value <= 59)
              this.setState({ selectedMinutes: value })
          }}
        />
        <Text style={styles.inputSeparator}>:</Text>

        <TextInput
          value={this.state.selectedSeconds}
          style={styles.input}
          keyboardType="number-pad"
          onChangeText={(value) => {
            if (
              value === '' ||
              (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 59)
            )
              this.setState({ selectedSeconds: value })
          }}
        />
      </View>
    )
  }

  render() {
    const { minutes, seconds } = getRemaining(this.state.remainingSeconds)
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        {this.state.isTimerRunning ? (
          <Text style={styles.timerText}>{`${minutes}:${seconds}`}</Text>
        ) : (
          this.renderPickers()
        )}
        {this.state.isTimerRunning ? (
          <TouchableOpacity
            onPress={this.stop}
            style={[styles.button, styles.stopButton]}
          >
            <Text style={[styles.buttonText, styles.stopButtonText]}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={this.start} style={styles.button}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }
}
