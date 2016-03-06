import Rx from 'rx';
import Server from  '../lib/server/Server'

const server = new Server({port: 8080});

class Users {
  @server.expose
  callMeEverySecond(times) {
    return Rx.Observable.timer(0, 1000).take(times);
  }
}
