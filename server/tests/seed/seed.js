const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'lakmal.caldera@gmail.com',
  password: 'one@123',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'jen@email.com',
  password: 'two@123',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, 'abc123').toString()
  }]
}];

const todos = [
  {
    _id: new ObjectID(),
    text: 'Fist test to do',
    _creator: userOneId
  },
  {
    _id: new ObjectID(),
    text: 'Second test to do',
    completed: true,
    completedAt: 123456,
    _creator: userTwoId
  }
];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => {
    done();
  });
}

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => {
    done();
  });
};

module.exports = {
  populateTodos,
  todos,
  populateUsers,
  users
}
