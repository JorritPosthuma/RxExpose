import { Server as WebSocketServer } from 'ws';
import Rx from 'rx';

import Connection from './Connection';

export default class Server {
  methods = {};
  connections = [];
  streams = {};

  constructor(options) {
    this.expose = this.expose.bind(this);

    this.socket = new WebSocketServer(options);
    this.streams.sockets = Rx.Observable.create((observer) => {
      this.socket.on('connection', observer.onNext.bind(observer));
    }).publish();
    this.streams.connections = this.streams.sockets.map((socket) => new Connection(this, socket));
    this.streams.connections.subscribe((connection) => { this.connections.push(connection); });
    this.streams.sockets.connect();
  }

  expose(target, name, descriptor) {
    this.methods[name] = descriptor.value;

    return descriptor;
  }
}
