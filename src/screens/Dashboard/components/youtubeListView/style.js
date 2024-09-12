import { StyleSheet, Dimensions } from "react-native";
import { Specs } from "../../../../utility/Theme";

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  carouselContainer: {
    backgroundColor: "white",
    marginTop: 10,
    // paddingLeft: 4,
    // borderWidth: 1,
    // borderColor: "white",
    // borderRadius: 8,
    flex: 1,
    paddingVertical: 4,
  },
  containerView: {
    marginTop: 10,
    // height: 280,
    backgroundColor: "white",
  },
  bannerBg: {
    width: screenWidth - 10,
    backgroundColor: "white",
  },
  bannerIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    paddingVertical: 4,
  },
  iconStyle: {
    fontSize: 30,
    alignSelf: "center",
    color: "black",
  },
  dotStyle: {
    width: 30,
    height: 12,
    borderRadius: 6,
    backgroundColor: "black",
  },
  inactiveDotStyle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "lightgray",
  },
  slider: {
    // backgroundColor: 'gray',
    // marginTop: 15,
    // overflow: 'hidden', // for custom animations
  },
  sliderContentContainer: {
    height: 240,
    marginTop: 20,
    backgroundColor: "white",
    // padding: 0, // for custom animation
    // margin: 0,
  },
  paginationContainer: {
    marginHorizontal: 10,
    alignSelf: "center",
  },
  paginationView: {
    paddingVertical: 10,
  },
  heading: {
    ...Specs.fontSemibold,
    fontSize: 18,
    color: "#373e73",
    marginTop: 5,
    marginLeft: 12,
  },
  imgContainer: {
    height: 200,
  },
  container2: {
    height: 200,
    width: screenWidth - 50,
    backgroundColor: "white",
  },
  container3: {
    justifyContent: "center",
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    height: 190,
    width: screenWidth - 45,
    backgroundColor: "white",
    marginHorizontal: 4,
  },
  playBtnContainer: {
    position: "absolute",
    height: 50,
    width: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
    zIndex: 9999,
    shadowColor: "white",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  playBtn: {
    height: 40,
    width: 40,
  
  },
  videoTitleContainer: {
    backgroundColor: "black",
    opacity: 0.8,
    width: screenWidth - 50,
    height: 100,
  },
  videoTitle: {
    ...Specs.fontBold,
    fontSize: 14,
    color: "white",
    textAlign: "left",
    padding: 4,
  },
  modalVideoContainer: {
    backgroundColor: "white",
    flex: 1,
  },
  videoCloseIcon: {
    zIndex: 1,
    top: 20,
    position: "absolute",
    right: 20,
    padding: 10,
  },
  shimmerContainer: {
    position: "absolute",
    top: 60,
    left: 10,
    right: 10,
  },
  shimmer: {
    borderRadius: 5,
  },
  listView: {
    marginTop: 10,
    marginBottom: 4,
    marginHorizontal: 8,
  },
});

export default styles;
