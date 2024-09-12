
import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import VideoPlayer from 'app/src/screens/Dashboard/VideoPlayer';
import { inject, observer } from 'mobx-react';
// import YouTube from 'react-native-youtube'
import Banner from 'app/src/screens/Dashboard/Banner'
import NetworkOps from 'app/src/network/NetworkOps';

const YOUTUBE_BANNER = require('app/src/assets/images/Banner/YOUTUBE_iCON.png');
const PLAY_IMAGE = require('app/src/assets/images/video_controls/overlayPlayIcon.png');
const PROFILEDEFAULT_IMAGE = require('../../assets/images/DashBoardHeader/profileImage.png');
const LOCATION_IMAGE = require('../../assets/images/DashBoardHeader/location_icon.png');
const TIME_IMAGE = require('../../assets/images/DashBoardHeader/time.png');


const url = 'https://s3.ap-south-1.amazonaws.com/vstg-mobileapp-prod/videos/Vestige.mp4'

// const APIKEY = 'AIzaSyCirUrpGRJujnjYKYvA1z-Qb_ZaDsGblfY'
const APIKEY = 'AIzaSyC4R-xDScsUPC4ojZ9Dx93uYvEELFMYP00'
const CHANNELID = 'UCBWMcm6IUyIw7CB7_N1nG6Q'
const RESULTS = 10


@inject('dashboard')
@observer
export default class VideoLiveFeed extends Component<*> {
  constructor(props) {
    super(props);
    this.props = props;
    // const selectedIndexVideo = this.props.videoGalleryList.findIndex((obj) =>  obj.selected === true )
    this.state = {
      pauseVideo : this.props.pauseVideo,
      data: [],
      videoId: null,
      height: 299
      // videoGalleryList: this.props.videoGalleryList,
      // videoUrl: this.props.videoGalleryList.length && this.props.videoGalleryList[selectedIndexVideo].videoUrl,
    }
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    // const selectedIndexVideo = this.props.videoGalleryList.findIndex((obj) =>  obj.selected === true )
    if( newProps.pauseVideo !== this.props.profileImage )  {
      this.setState({          
        pauseVideo: this.props.pauseVideo,
        // videoGalleryList: this.props.videoGalleryList,
        // videoUrl: this.props.videoGalleryList.length && this.props.videoGalleryList[selectedIndexVideo].videoUrl,
      });
    }
  }

  // componentDidMount() {
  // const url = `https://www.googleapis.com/youtube/v3/search/?key=${APIKEY}&channelId=${CHANNELID}&part=snippet,id&order=date&maxResults=${RESULTS}`;
  // const res =  NetworkOps.get(url)
  // const videoId = []
  // res && res.items && res.items.forEach(item => {
  //   videoId.push(item)
  // })
  // this.setState({
  //   data: videoId
  // }) 

  // For YoutubeData API Rules you can visit https://developers.google.com/youtube/v3/getting-started#quota

  // fetch(`https://www.googleapis.com/youtube/v3/search/?key=${APIKEY}&channelId=${CHANNELID}&fields=items(id,snippet/thumbnails/medium)&part=snippet,id&order=date&maxResults=${RESULTS}`)
  //   .then(res => res.json())
  //   .then(res => {
  //     const videoIdList = []
  //     if(!res.error) {
  //       res.items.forEach(item => {
  //         videoIdList.push(item)
  //       })
  //       this.setState({
  //         data: videoIdList
  //       }) 
  //     }
  //   })
  //   .catch(error => {
  //     console.error(error)
  //   })
  // }

  // setVideoUrl(selectedVideo){
  //   this.state.videoGalleryList.map( video => {
  //     if(video.videoId === selectedVideo.videoId){
  //       video.selected = true,
  //       this.setState({
  //         videoUrl: selectedVideo.videoUrl,
  //         pauseVideo: false
  //       })
  //     }
  //     else {
  //       video.selected = false
  //     }
  //   })
  // }

  render() {
    // const { video } = this.props;
    // const { description, locationName, videoUrl } = this.props.dashboard.getSelectedVideoData;
    // console.log(this.state.videoId)
    // if(this.state.data.length) {
    return (
      <View style={styles.container}>
        {/* <View style={[styles.header]}>
          <Image
            style={styles.userProfileImage}
            source={PROFILEDEFAULT_IMAGE}
            resizeMode='center'
          />
          <View style={styles.videoTitleView}>
            <View style={styles.nameView}>
              {video && video.title && <Text style={styles.nameText}>{video.title}</Text>}
            </View>
            <View style={styles.placeView}>
              <Image
                source={LOCATION_IMAGE}
                resizeMode='center'
              />
              { video && video.locationName && <Text style={styles.placeText}>{video.locationName}</Text> }
            </View>
          </View>
        </View>  */}
        {/* <View> */}
        {/* <YouTube
          // videoId={this.state.videoId ? this.state.videoId : this.state.data[0].id.videoId}
          videoId={this.props.videoId}
          play={false}             
          fullscreen={false}    
          loop={false}            
          apiKey={APIKEY}
          onReady={() => { 
            setTimeout(() => {
              this.setState({height: 300})
            }, 500)
          }}
          resumePlayAndroid={false}
          style={{ alignSelf: 'stretch', height: this.state.height }}
          showFullscreenButton={false}
        /> */}
        <TouchableOpacity 
          activeOpacity={0.5}
          onPress={()=> this.props.navigation.navigate('youtubeListing', { uri: 'https://www.youtube.com/channel/UCBWMcm6IUyIw7CB7_N1nG6Q', screenTitle: 'Video Gallery' })}
        >
          <Banner
            styles={styles.bannerView}
            resizeMode='cover'
            source={YOUTUBE_BANNER}
          />
        </TouchableOpacity>

        {/* <VideoPlayer
          // source={'https://www.youtube.com/watch?v=lY2yjAdbvdQ'}
          // source={video.url ? video.url : url}
          source={this.props.dashboard.getSelectedVideoUrl}
          style={{height:220, marginTop:7}}
          paused={this.state.pauseVideo}
          disableSeekbar
        /> */}
        {/* </View> */}
        {/* <View style={{height: 10}} /> */}
        {/* <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={this.props.videoGalleryList}
          // data={this.state.data}
          extraData={this.props.videoGalleryList}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            // (
            //   <TouchableOpacity
            //     style={{ margin: 5,  
            //       flex: 1,
            //       flexDirection: 'column'
            //     }}
            //     onPress={()=>  this.setState({ videoId: item.id.videoId })}
            //   >
            //     <View>
            //       <Image 
            //         style={{ height: 100, width: 140, borderRadius: 5, padding: 5 }} 
            //         source={{ uri:  item.snippet.thumbnails.medium.url}} 
            //       />
            //     </View>
            //     <View style={{ position: 'absolute', top: 30, left: 50 }}>  
            //       <Image style={{ width: 40, height: 35 }} source={PLAY_IMAGE} />
            //     </View>
            //   </TouchableOpacity>
            // )
            !item.selected && (
              <TouchableOpacity
                style={{ margin: 5 }}
                onPress={()=> this.props.dashboard.changeVideo(item)}
              >
                <Image style={{ height: 80, width: 100, borderRadius: 5 }} source={{ uri: item.videoThumbnail}} />
              </TouchableOpacity>
            )
          )}
        /> */}
        {/* <View style={{height: 10}} /> */}
      </View>
    );
    // }
    // return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    marginHorizontal:0,
    backgroundColor: '#fff',
  },
  header: {
    marginTop: 10,
    marginHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  userProfileImage: {
    height: 38,
    width: 38,
  },
  videoTitleView: {
    marginLeft: 10,
    marginBottom: 5,
  },
  nameView: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  nameText: {
    color: '#343e4a',
    ...Specs.fontMedium,
    fontSize: 16,
  },
  placeView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeText: {
    marginLeft: 5,
    color: '#a7aeb7',
    ...Specs.fontSemibold,
    fontSize: 14,
  },
  bannerView: {
    width: Dimensions.get('window').width,
    height: 100,
  },
});