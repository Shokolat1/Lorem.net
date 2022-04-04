const { MongoClient } = require('mongodb');

// const url = 'mongodb://localhost:27017';
const url = 'mongodb+srv://YT_Vet:98T57hWqveEEIctk@cluster0.kegcs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(url);

const dbName = 'LoremDB';

module.exports = {client, dbName};