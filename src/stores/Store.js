import NetworkOps from 'app/src/network/NetworkOps';
import MyFunds from './MyFunds';
import MyVouchers from './MyVouchers';
import Location from './Location';
import Dashboard from './Dashboard';
import Cart from './Cart';
import Profile from './Profile';
import Auth from './Auth';
import Training from './Training';
import Products from './Products';
import MyConsistency from './MyConsistency';
import Network from './Network';
import Search from './Search';
import MyBonus from './MyBonus';
import WishList from './WishList';
import Recommendation from './Recommendation';
import Checkout from './Checkout';
import Vbd from './Vbd';
import ChangePassword from './ChangePassword';
import Payments from './Payments';
import Branches from './Branches';
import Faq from './Faq';
import BankPan from './BankPan';
import MobileNumberUpdate from './MobileNumberUpdate';
import DeviceListing from './DeviceListing';
import AppConfiguration from './AppConfiguration';
import B2CFlow from './B2CFlow';

class Store {
  constructor() {
    this.myFunds = new MyFunds(this);
    this.myVouchers = new MyVouchers(this);
    this.location = new Location(this);
    this.dashboard = new Dashboard(this);
    this.cart = new Cart(this);
    this.profile = new Profile(this);
    this.auth = new Auth(this);
    this.products = new Products(this);
    this.training = new Training(this);
    this.myConsistency = new MyConsistency(this);
    this.network = new Network(this);
    this.search = new Search(this);
    this.myBonus = new MyBonus(this);
    this.wishList = new WishList(this);
    this.recommendation = new Recommendation(this);
    this.checkout = new Checkout(this);
    this.vbd = new Vbd(this);
    this.changePassword = new ChangePassword(this);
    this.payments = new Payments(this);
    this.branches = new Branches(this);
    this.faq = new Faq(this);
    this.bankPan = new BankPan(this);
    this.deviceListing = new DeviceListing(this);
    this.mobileNumberUpdate = new MobileNumberUpdate(this);
    this.appConfiguration = new AppConfiguration(this);
    this.B2CFlow=new B2CFlow(this)

    NetworkOps.init(this.auth);
  }

  async init() {
    await this.auth.init()
  }
}

export default new Store();