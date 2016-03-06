import Rx from 'rx';
import _ from 'lodash';
import WebSocket from 'ws';

import * as constants from '../shared/constants';
import { messageToData, filterEnvelope } from '../shared/methods';

export default class Connection {
  streams = {};

  constructor(server, socket) {
    this.server = server;
    this.socket = socket;

    this.streams.messages = Rx.Observable.create((observer) => {
      this.socket.on('message', observer.onNext.bind(observer));
    }).publish();
    this.streams.json = this.streams.messages.map(messageToData);
    this.streams.request = this.streams.json.filter(filterEnvelope);
    this.streams.calls = this.streams.request.filter(this.filterCalls);
    this.streams.calls.subscribe(this.onCall.bind(this));
    this.streams.messages.connect();
  }

  filterCalls(data) {
    if (data.type !== constants.REQUEST_CALL) return false;
    if (!_.has(data, 'name')) return false;
    if (!_.has(data, 'arguments')) return false;
    if (!_.isString(data.name)) return false;
    if (!_.isArray(data.arguments)) return false;

    return true;
  }

  onCall(call) {
    if (_.has(this.server.methods, call.name)) {
      const result = this.server.methods[call.name].call(null, call.arguments);

      if (result instanceof Promise) {
        this.handlePromiseResponse(call, result);
      } else if (result instanceof Rx.Observable) {
        this.handleStreamResponse(call, result);
      } else {
        this.handleSyncResponse(call, result);
      }
    }
  }

  handlePromiseResponse(call, promise) {
    promise.then(
      (result) => this.handleSyncResponse(call, result),
      (error) => this.sendError(call, error)
    );
  }

  handleStreamResponse(call, stream) {
    const subscription = stream.subscribe(
      (result) => {
        if (this.socket.readyState === WebSocket.OPEN) {
          this.sendResult(call, result)
        } else {
          subscription.dispose();
        }
      },
      (error) => this.sendError(call, error),
      () => this.sendComplete(call),
    );
  }

  handleSyncResponse(call, result) {
    this.sendResult(call, result);
    this.sendComplete(call);
  }

  sendResult(call, result) {
    this.send({
      type: constants.RESPONSE_RESULT,
      id: call.id,
      result
    });
  }

  sendError(call, error) {
    this.send({
      type: constants.RESPONSE_ERROR,
      id: call.id,
      error
    });
  }

  sendComplete(call) {
    this.send({
      type: constants.RESPONSE_COMPLETE,
      id: call.id,
    });
  }

  send(response) {
    try {
      this.socket.send(JSON.stringify(response));
    } catch(e) {
      console.error(e);
    }
  }
}
