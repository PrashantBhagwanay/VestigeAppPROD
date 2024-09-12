import { observable, action, makeAutoObservable } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';

export default class ChangePassword {
  @observable isLoading = false;
  @observable resMessage = '';

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setIsLoading = value => (this.isLoading = value);
  @action setResMessage = value => (this.resMessage = value);

  @action changePassword = async data => {
    this.setIsLoading(true);
    const res = await NetworkOps.postToJson(
      `${Urls.ServiceEnum.changePassword}`,
      data,
    );
    this.setIsLoading(false);
    if (res.name) {
      this.setResMessage(res.message);
      return false;
    } else {
      this.setResMessage(
        res.message || 'Your password is changed successfully',
      );
      return true;
    }
  };
}
