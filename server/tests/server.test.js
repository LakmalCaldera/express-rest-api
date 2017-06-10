const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {

  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
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


describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    const hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if(err){
          return done(err)
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if todo not found', (done) => {
    const hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/todos/abc123')
      .expect(400)
      .end(done);
  });


});


describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
      const hexId = todos[0]._id.toHexString();
      const text = "This is from the test suite!";
      const completed = true;
      request(app)
        .patch(`/todos/${hexId}`)
        .send({
          text,
          completed
        })
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(hexId);
          expect(res.body.text).toBe(text);
          expect(res.body.completed).toBe(completed);
        }).end((err) => {
          if(err){
            return done();
          }

          Todo.findById(hexId).then((todo) => {
            expect(todo.text).toBe(text);
            expect(todo.completed).toBe(completed);
            expect(todo.completedAt).toBeA('number');
            done();
          })
        });
  });

  it('should clear completedAt when todo is not completed', (done) => {
    const hexId = todos[1]._id.toHexString();
    const text = todos[1].text;
    const completed = false;
    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        text,
        completed
      })
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(hexId);
        expect(res.body.text).toBe(text);
        expect(res.body.completed).toBe(completed);
      }).end((err) => {
        if(err){
          return done();
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo.text).toBe(text);
          expect(todo.completed).toBe(completed);
          expect(todo.completedAt).toNotExist();
          done();
        })
      });
  })
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
      request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
      request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
});


describe('POST /users', () => {
  const email = 'awesome@gmail.com';
  const password = 'abc@123';

  it('should create a user', (done) => {
    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body.email).toBe(email);
        expect(res.body._id).toExist();
      }).end((err, res) => {
        if(err){
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.email).toBe(email);
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });
  it('should return validation errors if request invalid', (done) => {
    const email = 'awesom@e@gmail.com';
    const password = 'abc';
      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end((err, res) => {
          if(err){
            return done(err);
          }

          User.findOne({email}).then((user) => {
            expect(user).toNotExist();
            done();
          }).catch((e) => done(e));
        });
  });
  it('should not create user if email is in use', (done) => {
    const email = 'jen@email.com';
    const password = 'abc@1234';
      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .expect((res) => {
        }).end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      }).end((err, res) => {
        if(err){
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((err) => done(err));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      }).end((err, res) => {
        if(err){
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((err) => done(err));
      });
  });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
      request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .send()
        .expect(200)
        .end((err, res) => {
          if(err){
            return done(err);
          }

          User.findById(users[0]._id).then((user) => {
            expect(user.tokens.length).toBe(0);
            done();
          }).catch((err) => done(err));
        });
    });
});
