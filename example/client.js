import Client from  '../lib/client/Node';

const client = new Client('ws://localhost:8080');

client
.call('callMeEverySecond', 8)
.subscribe((result) => console.info(result));
