
const { connect } = require('mqtt');
const mysql = require('mysql2');
const config = require('../configs/database.json');

const connection = mysql.createPool({

    ...config

});

module.exports = connection.promise();
