# RxExpose - Javascript reactive RMI library

The goal of this library is to provide a simple way of communicating with a `NodeJS` backend. As an alternative to creating REST API's we use ES7 decorators, Websockets and RxJS streams to simply expose backend methods to a client.

## Example

### server.js - *npm run example-server*

```javascript
import Rx from 'rx';
import Server from  '../lib/server/Server'

const server = new Server({port: 8080});

class Users {
  @server.expose
  callMeEverySecond(times) {
    return Rx.Observable.timer(0, 1000).take(times);
  }
}
```

### client.js - *npm run example-client*

```javascript
import Client from  '../lib/client/Node';

const client = new Client('ws://localhost:8080');

client
.call('callMeEverySecond', 8)
.subscribe((result) => console.info(result)); // Will output 0 1 2 3 4 5 6 7
```

## Used technologies
 * ES7 decoraters (through babel and transform-decorators-legacy)
 * Websockets (ws)
 * RxJS

## Licence (MIT)

Copyright (c) 2016 Jorrit Posthuma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
