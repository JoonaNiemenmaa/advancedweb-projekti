DROP TABLE permissions;
DROP TABLE documents;
DROP TABLE users;

CREATE TABLE users (
	username	varchar(64) PRIMARY KEY,
	password	varchar(64) NOT NULL
);

CREATE TABLE documents (
	id			uuid PRIMARY KEY,
	owner		varchar(64) REFERENCES users (username) NOT NULL,
	name		varchar(255) NOT NULL,
	content		jsonb NOT NULL,
	lockHolder	varchar(64) REFERENCES users (username) DEFAULT NULL
);

CREATE TABLE permissions (
	username	varchar(64) REFERENCES users (username) NOT NULL,
	document	uuid REFERENCES documents (id) NOT NULL,
	PRIMARY KEY (username, document)
);
