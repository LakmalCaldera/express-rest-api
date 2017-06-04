const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());

// POST http method to create a resource
app.post('/todos', (req, res) => {
  //console.log(req.body);
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });
});

// GET http method to fetch all resources
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({
      todos
    });
  }, (err) => {
    res.status(400).send(err);
  })
});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
  const id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(400).send();
  }

  Todo.findById(id).then((todo) => {
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
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(400).send()
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if(!todo){
      return res.status(404).send()
    }
    res.send({todo});
  }).catch((err) => {
    res.status(404).send();
  });
})

app.listen(port, () => {
  console.log(`Started on port ${port}!`);
});

module.exports = {
  app
};
