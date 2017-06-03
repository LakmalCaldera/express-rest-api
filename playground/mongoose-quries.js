const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

const id = '5932d7788294af5c88213c24';

// if(!ObjectID.isValid(id)){
//   console.log('Id is not valid');
// }
//
// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log(todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log(todo);
// });
//
// Todo.findById(id).then((todo) => {
//   console.log(todo);
// }).catch((e) => {
//   console.log(e);
// });

Todo.findById(id).then((todo) => {
  if(!todo){
    return console.log('Unable to find todo.');
  }
  console.log(JSON.stringify(todo, undefined, 2));
}).catch((err) => {
  console.log(err);
});
