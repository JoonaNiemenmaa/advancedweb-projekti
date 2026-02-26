import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";

const sql = postgres({
	database: "advancedweb-project",
});

export async function registerUserSQL(username: string, hash: string) {
	return await sql`INSERT INTO users VALUES (${username}, ${hash})`;
}

interface IUser {
	username: string;
	password: string;
}

export async function getUserSQL(username: string) {
	return await sql<IUser[]>`SELECT * FROM users WHERE username=${username}`;
}

interface IParagraph {
	text: string;
}

interface IBlock {
	id: string;
	type: string;
	data: IParagraph;
}

export interface IContent {
	time: number;
	blocks: IBlock[];
	version: string;
}

interface IDocument {
	documentId: string;
	owner: string;
	name: string;
	content: IContent;
}

export async function getDocumentSQL(uuid: string) {
	return await sql<IDocument[]>`SELECT * FROM documents WHERE id=${uuid}`;
}

export async function getOwnedDocumentsSQL(owner: string) {
	return await sql<IDocument[]>`SELECT * FROM documents WHERE owner=${owner}`;
}

export async function deleteDocumentSQL(uuid: string) {
	return await sql<IDocument[]>`DELETE FROM documents WHERE id=${uuid}`;
}

export async function createDocumentSQL(owner: string, name: string) {
	return await sql`INSERT INTO documents VALUES (${uuidv4()}, ${owner}, ${name}, ${JSON.stringify({})})`;
}

export async function saveDocumentSQL(uuid: string, content: IContent) {
	return await sql`UPDATE documents SET content=${JSON.stringify(content)} WHERE id=${uuid}`;
}
