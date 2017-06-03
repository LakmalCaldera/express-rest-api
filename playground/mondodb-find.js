const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err){
    return console.log('Unabled to connect to mongodb server');
  }
  console.log('Connected to Mongodb Server');


  // db.collection('Users').find({
  //   _id: new ObjectID('5931b2f35f3df31ec589f613')
  // }).toArray().then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log('Unable to fetch todos, ', err);
  // });

  db.collection('Users').find().count().then((count) => {
    console.log('Todos count: ', count);
  }, (err) => {
    console.log('Unable to fetch todos, ', err);
  });


  //db.close();
});
