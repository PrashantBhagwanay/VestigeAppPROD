import React, {Component} from 'react';
import { View, StyleSheet, Dimensions} from 'react-native';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';
import { Specs } from 'app/src/utility/Theme';
import { inject, observer } from 'mobx-react';
// import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import { observable, makeObservable } from 'mobx';
import Pdf from 'react-native-pdf';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';
import { Header } from '../../components';

@inject('cart')
@observer
export default class OrderInvoice extends Component {
  @observable url: string;

  constructor(props) {
    super(props)
    makeObservable(this);
    this.props = props;
  }

  renderHeaderRight = () => {
    return (
      <HeaderRightIcons 
        share
        onPressShare={async() => {
          // const data = await RNFetchBlob.fetch('GET', props.route.params.url);
          // const shareData = {
          //   url: `data:application/pdf;base64, ${data.base64()}`,
          // }
          const url = {
            failOnCancel: false ,
            url:"data:application/pdf;base64,"+this.props.route.params.url
            };
          Share.open(url);
        }}
      />
    )
  }

  render() {
    let source = {uri:"data:application/pdf;base64,"+this.props.route.params.url, cache:true};
    return (
      <View style={{flex: 1}}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.order.orderInvoice.screenTitle}
          rightComponent={this.renderHeaderRight()}
        />
        <Pdf
          source={source}
          onError={(error)=>{
            console.log(error);
            // AlertClass.showAlert(strings.order.orderInvoice.errorTitle, 
            //   strings.order.orderInvoice.orderInvoiceIssue, 
            //   [{text: strings.viewCartScreen.alertButtonTextOk, onPress: () => this.props.navigation.goBack()}])
          }}
          style={styles.pdf} 
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerTitle:{
    ...Specs.fontBold,
    fontSize:18,
    color: '#373e73',
  },
  pdf: {
    flex:1,
    width:Dimensions.get('window').width,
  }
})