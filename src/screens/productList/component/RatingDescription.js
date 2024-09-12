import React, {Component} from 'react';
import { Text, View, StyleSheet, Image, Modal, TouchableOpacity, Dimensions, TouchableHighlight } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Icon } from 'react-native-elements';
import VideoPlayer from 'app/src/screens/Dashboard/VideoPlayer';
import autobind from 'autobind-decorator';
import moment from 'moment';
import StarRating from '../../../lib/starRating';
import Orientation from 'react-native-orientation-locker';
import { Specs } from 'app/src/utility/Theme';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';

const SCREEN_WIDTH = Dimensions.get('window').width;


export default class RatingDescription extends Component {
  constructor(props) {
    super(props)
    this.props = props
    this.state ={
      isModalVisible: false,
      videoModalVisible: false,
    }
  }

  @autobind
  modalClose(){
    this.setState({videoModalVisible: false});
    Orientation.lockToPortrait();
  }

  setModalVisible(visible,orientation) {
    if(orientation === 'show'){
      Orientation.lockToLandscape();
    }
    else{
      Orientation.lockToPortrait();
    }
    this.setState({videoModalVisible: visible});
  }

  render() {
    const { item } = this.props
    return(
      <View style={styles.itemHeading}>
        <View style={styles.userIconContainer}>
          <Image
            source={VESTIGE_IMAGE.DISTRIBUTOR_ICON}
            style={styles.distributorProfileImageStyle}
          />
        </View>
        <View style={styles.reviewRatingContainer}>
          <Text style={[styles.ratingText, { lineHeight: 25, ...Specs.fontMedium }]}>{ item.distributorName }</Text>
          <Text style={[styles.ratingText, { lineHeight: 20,  ...Specs.fontRegular }]} numberOfLines={50}>{ item.reviewDetail}</Text>
          <Text style={styles.dateStyles}>
            {'Posted on: '+moment(item.createdOn).format('Do MMMM YYYY  |  h:mm a')} 
          </Text>
          <View style={{ flexDirection: 'row' }}>
            { 
              item.reviewImages && (
                <Modal 
                  visible={this.state.isModalVisible} 
                  transparent={true}
                  onRequestClose={() => {
                    this.setState({ isModalVisible: false })
                  }}
                >
                  <ImageViewer 
                    imageUrls={[{url: item.reviewImages[0].imageUrl }]}
                    enableSwipeDown={true}
                    backgroundColor='#000'
                    onCancel={()=> this.setState({ isModalVisible: false })  }
                  />
                </Modal>
              )
            }
            {
              item.reviewImages && (
                <TouchableOpacity onPress={ () => this.setState({ isModalVisible: true })}>
                  <Image
                    style={{width: 70, height: 80, marginVertical: 5}}
                    source={{uri: item.reviewImages[0].imageUrl}}
                  />
                </TouchableOpacity>
              )
            }
            { 
              item.reviewVideos && (
                <Modal
                  animationType="slide"
                  transparent
                  visible={this.state.videoModalVisible}
                  onRequestClose={()=> this.modalClose()}
                  shadowOpacity={0.5}
                  supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
                >
                  <View style={styles.modalVideoContainer}>
                    <TouchableHighlight
                      style={styles.videoCloseIcon}
                      onPress={() => {
                        Orientation.lockToPortrait();
                        this.setModalVisible(!this.state.videoModalVisible, 'hide');
                      }}
                    >
                      <Icon name='close' size={30} color='#fff' />
                    </TouchableHighlight>
                    <VideoPlayer
                      source={item.reviewVideos[0].videoUrl}
                      paused={false}
                    />
                  </View>
                </Modal>
              )
            }
            {
              item.reviewVideos ? (
                <TouchableOpacity 
                  style={[styles.uploadImageStyles, { width: SCREEN_WIDTH * 0.30 }]}
                >
                  <VideoPlayer
                    source={item.reviewVideos[0].videoUrl}
                    style={{ height: 80 }}
                    paused
                    disableSeekbar
                    disableTimer
                    onPlay={ ()=>  this.setModalVisible(true, 'show') }
                    // disablePlayPause
                  />
                </TouchableOpacity>
              ) : null
            }
          </View>
          <View style={styles.ratingStarContainer}>
            <StarRating
              disabled
              starSize={8}
              maxStars={5}
              starStyle={{paddingHorizontal: 2}}
              rating={Math.ceil(item.productQuality)}
              fullStarColor='#f2b01e'
            />
            <Text style={styles.feedBackRatingText}>{item.productQuality}</Text>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  ratingText: {
    // ...Specs.fontRegular,
    fontSize: 14,
    color: '#46586f',
  },
  itemHeading: {
    flexDirection: 'row',
    marginRight: 10,
    marginBottom: 10,
    flex: 1,
  },
  distributorProfileImageStyle: {
    height: 45,
    width: 45,
    borderRadius: 20,
  },
  userIconContainer: {
    flexDirection: 'column',
    marginRight: 20
  },
  reviewRatingContainer: {
    flexDirection: 'column',
    flex: 1
  },
  ratingStarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginTop: 10
  },
  feedBackRatingText: {
    color: '#979ba0',
    fontSize: 10,
    textAlign: 'center',
    alignItems: 'center',
    marginLeft: 4
  },
  uploadImageStyles: {
    marginLeft: 4,
    marginVertical: 5
  },
  modalVideoContainer: {
    backgroundColor: 'black', 
    flex:1
  },
  videoCloseIcon: {
    zIndex: 1, 
    top: 20,
    position: 'absolute', 
    right: 20, 
    padding: 10
  },
  dateStyles: {
    marginTop: 3,
    ...Specs.fontRegular, 
    fontSize: 12, 
    color: '#a2a2a2', 
  },
})
