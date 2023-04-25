require('dotenv').config();
const express = require('express')
const http = require('http')
const cors = require('cors')

const connection = require('./database/connection')
const handleRoutes = require('./routes/api')

const app = express()
app.use(cors());

// connect to database
connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      console.error('Unable to connect to Database');
      connection.end()
      return;
    }
    console.log('Connected as id ' + connection.threadId);
    startServer();
});

//only start the serve if connected to the datebase
const startServer = () => {

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static("public"));


    //rules of the api
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }
        next();
    })

    //routes
    handleRoutes(app);

    //health check
    app.get('/api/v1/health/check', (req, res) => res.status(200).json({ message: 'Health Check Ok' }));

    //error handling
    app.use((req, res) => {
        const error = new Error('Not Found');
        console.log(error);

        return res.status(404).json({ message: error.message });
    });

    //start the server
    http.createServer(app).listen(process.env.SERVER_PORT, () => console.log(`Server running on port ${process.env.SERVER_PORT}`));

}