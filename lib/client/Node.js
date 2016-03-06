import Rx from 'rx';
import WebSocket from 'ws';

import Client from './Client';

export default class NodeClient extends Client {

  constructor(url) {
    const ws = new WebSocket(url);
    const stream = Rx.Observable.create((observer) => {
      ws.on('message', (data, flags) => observer.onNext(data));
    }).publish();

    super(stream);

    this.ws = ws;
    this.open = new Promise((resolve, reject) => {
      this.ws.on('open', () => resolve());
    });
  }

  send(message) {
    this.open.then(() => this.ws.send(message));
  }
}
