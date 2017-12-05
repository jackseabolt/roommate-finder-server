'use strict'; 
const express = require('express'); 
const mongoose = require('mongoose'); 
const morgan = require('morgan'); 
const cors = require('cors'); 
const { PORT, CLIENT_ORIGIN, DATABASE_URL } = require('./config');
const { router: usersRouter } = require('./users'); 


const app = express(); 
mongoose.Promise = global.Promise; 

app.use(
    morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
        skip: (req, res) => process.env.NODE_ENV === 'test'
    })
); 

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.get('/test', (req, res) => {
    return res.json({message: "hey there"}); 
})

app.get()

let server; 
function runServer() {
    return new Promise((resolve, reject) => {
        mongoose.connect(DATABASE_URL, {useMongoClient: true}, err => {
            if(err) {
                return reject(err)
            }
            server = app.listen(PORT, () => {
                console.log(`The application is listening on port ${PORT}`)
                resolve(); 
            })
            .on('error', err => {
                mongoose.disconnect(); 
                reject(err); 
            }); 
        }); 
    }); 
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new PromiseProvider((resolve, reject) => {
            console.log('Closing server'); 
            server.close(err => {
                if(err){
                    return reject(err); 
                }
                resolve(); 
            });
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err))
}

module.exports = { app, runServer, closeServer }; 


