require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const port = process.env.PORT;
const app = express();

app.use(bodyParser.json());

// POST http method to create a resource
app.post('/todos', authenticate, (req, res) => {
  //console.log(req.body);
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });
});

// GET http method to fetch all resources
app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({
      todos
    });
  }, (err) => {
    res.status(400).send(err);
  })
});

// GET /todos/:id
app.get('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(400).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if(!todo){
      res.status(404).send();
    }else{
      res.send({
        todos: [
          todo
        ]
      })
    }
  }).catch((err) => {
    res.status(400).send();
  });

});


// DELETE /todos/:id
app.delete('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(400).send()
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if(!todo){
      return res.status(404).send()
    }
    res.send({todo});
  }).catch((err) => {
    res.status(404).send();
  });
});

// PATCH /todos/:id
app.patch('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)){
    return res.status(400).send()
  }

  if(_.isBoolean(body.completed) && body.completed){
      body.completedAt = new Date().getTime();
  }else{
      body.completed = false;
      body.completedAt = null;
  }

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {
    $set: body
  }, {
    new: true
  }).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }
    res.send(todo);
  }).catch((err) => {
    res.status(400).send();
  });
});

// POST /users
app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  var user = new User({
    email: body.email,
    password: body.password
  });

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((err) => {
    res.status(400).send(err);
  });
});

app.get('/users/me', authenticate,(req, res) => {
    res.send(req.user);
});

// POST /users/login {email, password}
app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    var user = new User({
      email: body.email,
      password: body.password
    });

    User.findByCredentials(body.email, body.password).then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(user);
      });
    }).catch((err) => {
      res.status(400).send();
    })

});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}!`);
});

module.exports = {
  app
};
