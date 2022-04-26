const mqtt = require('mqtt');

const client = mqtt.connect('ws://broker.emqx.io/mqtt', { port: 8083 });

client.on('connect', () => {
    client.subscribe('C4:4F:33:53:FD:61/data')
});

module.exports = client;