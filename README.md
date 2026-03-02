# Advanced Web Applications Project

This is the documentation for my project submission

## Technology

- On the frontend the project uses vanilla JavaScript with Bootstrapjs for styling and additional functionality. The text document editor used is editorjs
- The main components of the backend are nodejs, expressjs and postgresql.
- The backend also has bcrypt and jsonwebtoken for authentication / authorization, express-validator for request validation, postgresjs for interacting with a postgresql database, dotenv for reading a .env file, and finally uuid for generating uuids

## Installation

First clone the repository like so:

~~~shell
$ git clone https://github.com/JoonaNiemenmaa/advancedweb-projekti
~~~

### Install postgresql

This project requires postgresql as its database

Once the backend server gets up and running it automatically connects to a postgresql database called 'advancedweb-project'. The rest of the parameters (i.e. database user, port, host) it obtains from the operating system's environment variables. I have only tested this with Linux, so I do not know the details of how to get this up and running correctly on Windows. On Linux it should simply be a case of installing postgresql and creating a database called 'advancedweb-project'.

In case the environment variables aren't properly setup you can change the options the project uses to connect to postgresql directly. The connection is made at the beginning of the ```server/src/database.ts``` file and it looks like this: 

~~~TypeScript
const sql = postgres({
	database: "advancedweb-project",
});
~~~
Here is documentation on how this call can be configured in case it needs to be changed to successfully connect to the database: https://github.com/porsager/postgres?tab=readme-ov-file#connection

Once the database connection is fine, it also has to be initialized with all the required tables.

```db/init.sql``` contains a script that should be run on the database once it's created to initialize the tables correctly.

### Running the web app itself

To run the app, change to the client directory, install dependencies and run the client:start script.

~~~shell
$ npm install
$ npm run client:start
~~~

Then change to the server directory, install dependencies and run the server:start script.


~~~shell
$ npm install
$ npm run server:start
~~~

## Points

Here are the points the project fulfills

- Mandatory requirements 25p
- The document editor includes wysiwyg editor of some sort (e.g. https://quilljs.com/, https://editorjs.io/, https://draftjs.org/) 2p

In total 27p
