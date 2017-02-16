'use strict';

const pg = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();
const conString = '';// TODO: Don't forget to set your own conString
const client = new pg.Client(conString);
client.connect(function(err) {
  if (err) console.error(err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// NOTE: Routes for requesting HTML resources
app.get('/', function(request, response) {
  response.sendFile('index.html', {root: '.'});
});

app.get('/new', function(request, response) {
  response.sendFile('new.html', {root: '.'});
});

// NOTE: Routes for making API calls to enact CRUD Operations on our database
app.get('/articles', function(request, response) {
  // REVIEW: We now have two queries which create separate tables in our DB, and reference the authors in our articles.
  client.query(`
    CREATE TABLE IF NOT EXISTS
    authors (
      author_id SERIAL PRIMARY KEY,
      author VARCHAR(255) UNIQUE NOT NULL,
      "authorUrl" VARCHAR (255)
    );`
  )
  client.query(`
    CREATE TABLE IF NOT EXISTS
    articles (
      article_id SERIAL PRIMARY KEY,
      author_id INTEGER NOT NULL REFERENCES authors(author_id),
      title VARCHAR(255) NOT NULL,
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL
    );`
  )
  // REVIEW: This query will join the data together from our tables and send it back to the client.
  client.query(
    ``, // TODO: Write a SQL query which inner joins the data from articles and authors from all records
    function(err, result) {
      if (err) console.error(err);
      response.send(result.rows);
    }
  );
});

app.post('/articles', function(request, response) {
  client.query(
    '', // TODO: Write a SQL query to insert a new author, ON CONFLICT DO NOTHING
    [], // TODO: Add the author and "authorUrl" as data for the SQL query
    function(err) {
      if (err) console.error(err)
      queryTwo() // This is our second query, to be executed when this first query is complete.
    }
  )

  function queryTwo() {
    client.query(
      ``, // TODO: Write a SQL query to retrieve the author_id from the authors table for the new article
      [], // TODO: Add the author name as data for the SQL query
      function(err, result) {
        if (err) console.error(err)
        queryThree(result.rows[0].author_id) // This is our third query, to be executed when the second is complete. We are also passing the author_id into our third query
      }
    )
  }

  function queryThree(author_id) {
    client.query(
      ``, // TODO: Write a SQL query to insert the new article using the author_id from our previous query
      [], // TODO: Add the data from our new article, including the author_id, as data for the SQL query.
      function(err) {
        if (err) console.error(err);
        response.send('insert complete');
      }
    );
  }
});

app.put('/articles/:id', function(request, response) {
  client.query(
    ``, // TODO: Write a SQL query to retrieve the author_id from the authors table for the new article
    [], // TODO: Add the author name as data for the SQL query
    function(err, result) {
      if (err) console.error(err)
      queryTwo(result.rows[0].author_id)
      queryThree(result.rows[0].author_id)
    }
  )

  function queryTwo(author_id) {
    client.query(
      ``, // TODO: Write a SQL query to update an existing author record
      [] // TODO: Add the values for this table as data for the SQL query
    )
  }

  function queryThree(author_id) {
    client.query(
      ``, // TODO: Write a SQL query to update an existing article record
      [], // TODO: Add the values for this table as data for the SQL query
      function(err) {
        if (err) console.error(err);
        response.send('insert complete');
      }
    );
  }
});

app.delete('/articles/:id', function(request, response) {
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  );
  response.send('Delete complete');
});

app.delete('/articles', function(request, response) {
  client.query(
    'DELETE FROM articles;'
  );
  response.send('Delete complete');
});

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}!`);
});
