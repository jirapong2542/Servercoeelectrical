const mqtt = require('mqtt');

const client1 = mqtt.connect('ws://broker.emqx.io/mqtt', { port: 8083 });

client1.on('connect', () => {
    client1.subscribe('C4:4F:33:53:FD:61')
});

module.exports = client1;