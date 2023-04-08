import cookie from 'react-cookies';

interface Message {
  type: string;
  state: boolean;
  data: any;
}

class AddWebClinet {
  ws: WebSocket | undefined;
  errorCb: ((mess: any) => void) | undefined;
  closeCb: ((mess: any) => void) | undefined;
  cb = new Map<string, ((any: any) => void)[]>();
  connect() {
    this.ws = new WebSocket('ws://localhost/ws/model');
    this.ws.addEventListener('error', () => {
      this.ws?.addEventListener('error', (err) => {
        if (this.errorCb) this.errorCb(err);
      });
    });
    this.ws.addEventListener('close', (err) => {
      if (this.errorCb) this.errorCb(err);
    });
    const promise = new Promise((rs, rj) => {
      if (this.ws) {
        this.ws.addEventListener('open', (da) => {
          const sessionid = cookie.load('sessionid');
          this.sendData('cookie', sessionid);
          rs(da);
        });
      } else {
        rj('Unable to connect server!');
      }
    });

    this.ws?.addEventListener('message', (message: MessageEvent<string>) => {
      const data: Message = JSON.parse(message.data);
      const pmc = this.cb.get(data.type);

      if (pmc)
        if (data.state) {
          pmc[0](data.data);
        } else {
          pmc[1](data.data);
        }
    });
    return promise;
  }

  onError(cb: (mess: any) => void) {
    this.errorCb = cb;
  }
  onClose(cb: (mess: any) => void) {
    this.closeCb = cb;
  }

  sendData(option: string, data: any) {
    const dataStruct = {
      type: option,
      state: true,
      data: data,
    } as Message;
    const jsonString = JSON.stringify(dataStruct);
    this.ws?.send(jsonString);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const This = this;
    const pm = new Promise((rc, rj) => {
      This.cb.set(option, [rc, rj]);
    });
    pm.catch((err) => {
      if (this.errorCb) this.errorCb(err);
      return err;
    });
    return pm;
  }

  getDescript() {
    return this.sendData('getDescript', null);
  }

  setData(data: string | ArrayBuffer, fileType: string, ignoreIndex: boolean) {
    return this.sendData('setData', { ignoreIndex, fileType, data });
  }

  dataType() {
    return this.sendData('getDataType', null);
  }

  missingInfo() {
    return this.sendData('getMissingInfo', null);
  }
  setYlable(yLable: string) {
    return this.sendData('setYlable', yLable);
  }

  getBinner() {
    return this.sendData('getBinner', null);
  }

  useLable(lable: string, use: boolean) {
    return this.sendData('useLable', {
      lable,
      use,
    });
  }
  getLableUsed() {
    return this.sendData('getLableUsed', null);
  }

  generateModel(data: any) {
    return this.sendData('gennerateModel', data);
  }

  genRocAuc() {
    return this.sendData('genRocAuc', '');
  }
  testModel() {
    return this.sendData('testModel', '');
  }
  setMissingMethod(lable: string, method: string, def: string) {
    return this.sendData('setMissingMethod', {
      lable,
      method,
      default: def,
    });
  }
  
  
  getInterceptCoefficient(){
    return this.sendData('getInterceptCoefficient',"");
  }
  
  getOdds(){
    return this.sendData('getOdds',"");
  }
  
  saveModel(name: string) {
    return this.sendData('saveModel', {
      name,
    });
  }

  close() {
    this.ws?.close();
  }
}

export { AddWebClinet };
