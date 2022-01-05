const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const usersAlreadyExist = users.some((user) => user.username === username);

  if (usersAlreadyExist) {
    return response.status(400).json({ error: "User already exists" });
  }

  const userId = uuidv4();

  users.push({
    id: userId,
    name,
    username,
    todos: [],
  });

  return response
    .status(201)
    .json(users.filter((user) => user.id === userId))
    .send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const todoId = uuidv4();

  const todoOperation = {
    id: todoId,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todoOperation);

  return response
    .status(201)
    .json(user.todos.filter((todo) => todo.id === todoId))
    .send();
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todos) => todos.id === id);
  if (!todo) {
    return response.status(400).json({ error: "Todo not found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todos) => todos.id === id);
  if (!todo) {
    return response.status(400).json({ error: "Todo not found" });
  }

  todo.done = true;

  return response.status(200).send();
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todos) => todos.id === id);
  if (!todo) {
    return response.status(400).json({ error: "Todo not found" });
  }

  user.todos.splice(todo, 1);

  return response.status(200).send();
});

module.exports = app;
