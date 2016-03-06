import Rx from 'rx';
import _ from 'lodash';

import * as constants from '../shared/constants';
import { messageToData, filterEnvelope } from '../shared/methods';

export default class Client {
  callId = 0
  calls = {};
  streams = {};

  constructor(input) {
    this.streams.input = input;
    this.streams.json = this.streams.input.map(messageToData);
    this.streams.response = this.streams.json.filter(filterEnvelope);
    this.streams.result = this.streams.response.filter(this.filterResult);
    this.streams.result.subscribe(this.onResult.bind(this));
    this.streams.input.connect();
  }

  call(name, ...args) {
    const request = {
      type: constants.REQUEST_CALL,
      name: name,
      id: this.callId++,
      arguments: args,
    }

    return Rx.Observable.create((observer) => {
      this.calls[request.id] = observer;
      this.send(JSON.stringify(request));
    });
  }

  filterResult(data) {
    if (data.type !== constants.RESPONSE_RESULT) return false;
    if (!_.has(data, 'result')) return false;

    return true;
  }

  onResult(result) {
    this.calls[result.id].onNext(result.result);
  }
}
