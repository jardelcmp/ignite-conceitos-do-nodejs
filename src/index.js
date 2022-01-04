const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;
    const user = users.find((user) => user.username === username);

    if (!user) {
        return response.status(400).json({ error: "User not exists!!!" });
    }
    request.user = user;
    return next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const findUsername = users.find((user) => user.username === username);

    if (findUsername) {
        return response.status(400).json({ error: "User already exists!!!" });
    }

    const user = {
        name,
        username,
        id: uuidv4(),
        todos: []
    }
    users.push(user);
    return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;
    const todo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    }
    user.todos.push(todo);
    return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { id } = request.params;
    const { title, deadline } = request.body;
    const { user } = request;

    const findTodo = user.todos.find((todo) => todo.id === id);
    if (!findTodo) {
        return response.status(404).json({ error: "todo not found" });
    }

    user.todos.map((todo) => {
        if (todo.id === id) {
            todo.title = title;
            todo.deadline = new Date(deadline);
            return todo;
        }
        return todo;
    });
    return response.status(200).send(findTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { id } = request.params;
    const { user } = request;

    const findTodo = user.todos.find((todo) => todo.id === id);
    if (!findTodo) {
        return response.status(404).json({ error: "todo not found" });
    }

    user.todos.map((todo) => {
        if (todo.id === id) {
            todo.done = true;
            return todo;
        }
        return todo;
    });
    return response.status(200).send(findTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { id } = request.params;
    const { user } = request;

    const indexTodo = user.todos.findIndex((todo) => todo.id === id);
    if (indexTodo >= 0) {
        user.todos.splice(indexTodo, 1);
        return response.status(204).send();
    }
    return response.status(404).json({ error: "todo not found" });
});

module.exports = app;