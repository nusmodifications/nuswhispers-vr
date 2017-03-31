import React from 'react';
import {
  AppRegistry,
  Animated,
  asset,
  StyleSheet,
  Pano,
  Text,
  View,
  Image,
  Scene,
  Sound,
} from 'react-vr';
import _ from 'lodash';

const style = {
  fontSize: 0.2,
  layoutOrigin: [0.5, 0.5],
  paddingLeft: 0.2,
  paddingRight: 0.2,
  textAlign: 'center',
  textAlignVertical: 'center',
}

const DEGREES = 180;
const LOOP = 16;
const SOUND_DELAY = 500;

export default class WelcomeToVR extends React.Component {
  state = {
    offset: 0,
    rotation: 0,
    distance: 8,
    confessions: [],
    playSound: false,
  };

  componentDidMount() {
    this.fetchConfession();
  }

  fetchConfession = () => {
    fetch(`https://nuswhispers.com/api/confessions/popular?count=1&offset=${this.state.offset}`)
      .then(response => response.json())
      .then(response => {
        this.setState({
          confessions: response.data.confessions,
        });
      });
  }

  render() {
    let chunks = [];
    let confession = null;
    if (this.state.confessions[0]) {
      confession = this.state.confessions[0];
      chunks = _.chunk(confession.content.replace(/\n/g, '').split(' '), 8);
    }
    chunks = chunks.splice(0, 6);
    if (chunks.length) {
      chunks[chunks.length-1].push('...');
    }
    return (
      <View>
        <Scene style={{
          transform:[{
            rotateY: this.state.rotation,
          }],
        }}/>
        <Pano source={asset('chess-world-blue.jpg')}/>
        <View
          style={{
            transform: [{translate: [0, (chunks.length / 2) * 0.3, -3]}],
          }}
        >
          {confession && <Text style={style}>#{confession.confession_id}</Text>}
          {chunks.map((chunk, index) =>
            <Text key={index}
              style={style}
            >
              {chunk.join(' ')}
            </Text>
          )}
          <Text style={style}>&lt;3</Text>
          {confession &&
            <Text style={{
              ...style,
              paddingBottom: 0.6,
              color: 'red',
            }}
              onInput={(event) => {
                if (event.nativeEvent.inputEvent.eventType === 'click') {
                  this.setState({
                    offset: this.state.offset + 1,
                  }, this.fetchConfession);
                  if (this.state.offset === 2) {
                    setTimeout(() => {
                      this.setState({
                        playSound: true,
                      });
                    }, SOUND_DELAY);
                    const timer = setInterval(() => {
                      this.setState({
                        rotation: this.state.rotation + 5,
                      });
                      if (this.state.rotation === DEGREES) {
                        clearInterval(timer);
                        const timer2 = setInterval(() => {
                          this.setState({
                            distance: this.state.distance - 0.3,
                          });
                          if (this.state.distance < 2) {
                            clearInterval(timer2);
                          }
                        }, LOOP);
                      }
                    }, LOOP);
                  }
                }
              }}
            >
              Next Confession
            </Text>
          }
        </View>
        <Image
          source={asset('freak.jpg')}
          style={{
            width: 4,
            height: 3,
            transform: [{translate: [-2, 4.5, this.state.distance]}],
          }}
        >
          <Sound
            source={asset('scream.wav')}
            playStatus={this.state.playSound ? 'play' : 'stop'}
            autoPlay={false}
          />
        </Image>
      </View>
    );
  }
};

AppRegistry.registerComponent('WelcomeToVR', () => WelcomeToVR);
