const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(u => u.username === username);

  if (user){
    request.user = user; 
    return next();
  }

  return response.status(404).json({error: "Usuário não foi encontrado."});

}

app.post('/users', (request, response) => {

  const {name, username} = request.body;

  const userExists = users.some(u=> u.username === username);

  if (userExists){
     return response.status(400).json({error: "Usuário já está cadastado, informe outro usuário!"});
  }

  const user = { 
                  id: uuidv4(), 
                  name, 
                  username, 
                  todos: []
                };

  users.push(user);

  return response.status(201).json(user);          
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.json(user.todos);

  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const todosInsert = {
    id: uuidv4(),
    title, 
    done : false,
    deadline: new Date(deadline),
    created_at : new Date()
  }

  user.todos.push(todosInsert);

  return response.status(201).json(todosInsert);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const {title, deadline} = request.body;

  const todoUpdate = user.todos.find(t => t.id = id);  

  if (todoUpdate) {     
     todoUpdate.title = title;
     todoUpdate.deadline = new Date(deadline);

    return response.json(todoUpdate);
  } 

 return response.status(404).json({error: "Atividade não encontrada!"}); 
  

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params; 

  const todoUpdate = user.todos.find(t => t.id === id);  

  if (todoUpdate) {     
    todoUpdate.done = true;

    return response.json(todoUpdate);
  } 

 return response.status(404).json({error: "Atividade não encontrada!"}); 
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params; 
  const todo = user.todos.find(t => t.id === id); 
  
  if (todo){
     user.todos.splice(user.todos.indexOf(todo),1);

    return response.status(204).send();
  }

  return response.status(404).json({error: "Atividade não encontrada!"}); 

});

module.exports = app;