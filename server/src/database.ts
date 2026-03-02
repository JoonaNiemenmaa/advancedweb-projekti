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

export interface IDocument {
	documentId: string;
	owner: string;
	name: string;
	content: IContent;
	lockHolder: string | null;
}

export async function getDocumentSQL(uuid: string) {
	console.log(uuid);
	return await sql<IDocument[]>`SELECT * FROM documents WHERE id=${uuid}`;
}

export async function getAllDocumentsSQL(username: string) {
	return await sql<
		IDocument[]
	>`SELECT id, owner, name, content, lockHolder FROM documents LEFT OUTER JOIN permissions ON id = document WHERE (owner = ${username} OR username = ${username})`;
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

export async function renameDocumentSQL(
	documentId: string,
	newDocumentName: string,
) {
	return await sql`UPDATE documents SET name=${newDocumentName} WHERE id=${documentId}`;
}

interface IPermission {
	username: string;
}

export async function getUsersWithPermissionSQL(uuid: string) {
	return await sql<
		IPermission[]
	>`SELECT username FROM permissions WHERE document=${uuid}`;
}

export async function addPermissionsSQL(uuid: string, username: string) {
	return await sql`INSERT INTO permissions VALUES (${username}, ${uuid})`;
}

export async function removePermissionsSQL(uuid: string, username: string) {
	return await sql`DELETE FROM permissions WHERE document = ${uuid} AND username = ${username}`;
}
