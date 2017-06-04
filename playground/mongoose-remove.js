const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

const id = '5932d7788294af5c88213c24';

// Todo.remove({}) - Remove all documents
Todo.remove({}).then((result) => {
  console.log(result);
})

// Todo.findOneAndRemove
// Todo.findByIdAndRemove

Todo.findByIdAndRemove(id).then((todo) => {
  console.log(todo);
})
