import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Dimensions,
  ScrollView,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  Modal,
  Platform,
} from "react-native";
// import propTypes from "prop-types";
// import YoutubePlayer from "react-native-youtube-iframe";
// import Carousel, { Pagination } from "react-native-snap-carousel";
import styles from "./style";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const HEIGHT = screenHeight - 60;
const WIDTH = screenWidth - 20;
const PLAY_BUTTON = require("../../../../assets/images/play_button.png");

const YoutubeListView = ({ youtubeVids, navigation }) => {
  const ComponentYoutubeItem = ({ item, index }) => {
    const mUrl = item?.videoUrl || "";
    // const mArray = mUrl?.split("/");
    // const vidId = mArray[mArray?.length - 1];
    const thumbImg = { uri: item?.thumbUrl };

    const onPressPlay = () => {
      navigation.navigate("youtubeListing", {
        uri: mUrl,
        screenTitle: "Our Videos",
      });
    };

    return (
      <>
        <View style={styles.container3}>
          <Image
            source={thumbImg}
            resizeMode="cover"
            style={styles.container2}
          />
          <TouchableOpacity onPress={onPressPlay} style={styles.playBtnContainer}>
            <Image
              source={PLAY_BUTTON}
              resizeMode="contain"
              style={styles.playBtn}
            />
          </TouchableOpacity>
          <View style={styles.videoTitleContainer}>
            <Text style={styles.videoTitle}>{item?.name || ""}</Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <View style={styles.carouselContainer}>
      <Text style={styles.heading}>Our Videos</Text>
      <View style={styles.listView}>
        <FlatList
          data={youtubeVids}
          keyExtractor={(item, index) => index.toString()}
          enableEmptySections={true}
          renderItem={ComponentYoutubeItem}
          horizontal
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          snapToInterval={screenWidth - 60}
        />
      </View>
    </View>
  );
};

export default YoutubeListView;
