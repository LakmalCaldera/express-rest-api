const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'Fist test to do'
  },
  {
    _id: new ObjectID(),
    text: 'Second test to do'
  }
];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => {
    done();
  });
});

describe('POST /todos', () => {

  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      }).end((err, res) => {
        if(err){
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a new todo with invalid body data', (done) => {
      request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .catch((err, res) => {
          if(err){
            return done(err);
          }
        });

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => {
          done(e);
        });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
      var todoToSearch = todos[0];
      request(app)
        .get(`/todos/${todoToSearch._id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todos[0]).toInclude(todoToSearch)
        })
        .end(done)
  });

  it('should return a 404 when todo not found', (done) => {
    const id = '5932d7788294af5c88213c28';

    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it('should return a 400 when todo id invalid', (done) => {
    const id = '5932d7788294af5c88213c2811';

    request(app)
      .get(`/todos/${id}`)
      .expect(400)
      .end(done);
  });
});
