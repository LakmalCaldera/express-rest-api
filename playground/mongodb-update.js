const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err){
    return console.log('Unabled to connect to mongodb server');
  }
  console.log('Connected to Mongodb Server');


  db.collection('Todos').findOneAndUpdate({
    age: 19
  }, {
    $set: {
      completed: true,

    }
  }, {
    returnOriginal: false
  }).then((res) => {
    console.log(res);
  });

  //db.close();
});
