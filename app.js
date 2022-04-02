const express = require('express');
const app = express();

/*app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-Width, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'Get, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
})*/

module.exports = app;