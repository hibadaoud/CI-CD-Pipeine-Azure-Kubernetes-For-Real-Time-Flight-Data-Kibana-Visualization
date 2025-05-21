const cors = require('cors')
const express = require('express');
const authRoutes = require('./authRoutes');

function createApp() {
    const app = express();

    app.use(cors())

    app.use(express.json());
    
    app.use('/', authRoutes);


    return app
}
module.exports = createApp;
