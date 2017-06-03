const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err){
    return console.log('Unabled to connect to mongodb server');
  }
  console.log('Connected to Mongodb Server');

  // Delete Many
  db.collection('Todos').deleteMany({age: 19}).then((res) => {
    console.log(res);
  }, (err) => {
    console.log(err);
  });

  // Delete One -  Delete first occurance!!
  db.collection('Todos').deleteOne({age: 19}).then((res) => {
    console.log(res);
  }, (err) => {
    console.log(err);
  });

  // Find One and delete - Returned the deleted document
  db.collection('Todos').findOneAndDelete({age: 19}).then((res) => {
    console.log(res);
  }, (err) => {
    console.log(err);
  });

  //db.close();
});
