import { Router, Request, Response } from "express";
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH, validateToken } from "./auth";
import {
	IContent,
	IDocument,
	createDocumentSQL,
	getUserSQL,
	getDocumentSQL,
	deleteDocumentSQL,
	saveDocumentSQL,
	getAllDocumentsSQL,
	getUsersWithPermissionSQL,
	addPermissionsSQL,
	removePermissionsSQL,
	renameDocumentSQL,
	updateLockHolderSQL,
} from "./database";
import { body, validationResult } from "express-validator";

const service = Router();

const MIN_DOCUMENT_NAME_LENGTH = 1;
const MAX_DOCUMENT_NAME_LENGTH = 255;

service.post(
	"/api/document",
	validateToken(),
	body("name").notEmpty().isString().isLength({
		min: MIN_DOCUMENT_NAME_LENGTH,
		max: MAX_DOCUMENT_NAME_LENGTH,
	}),
	async (request: Request, response: Response) => {
		const result = validationResult(request);
		if (!result.isEmpty()) {
			return response.status(400).send({
				message: "validation error",
				errors: result.array(),
			});
		}

		if (!request.body.payload) {
			return response.status(500).send({
				message: "internal server error",
			});
		}

		const username = request.body.payload.username;
		const documentName = request.body.name;

		try {
			const user = (await getUserSQL(username))[0];

			if (!user) {
				return response.status(500).send({
					message: "no such user",
				});
			}

			await createDocumentSQL(username, documentName);

			return response.status(200).send({
				message: `document '${documentName}' created successfully!`,
			});
		} catch (error) {
			console.error(error);
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

service.put(
	"/api/document/rename",
	validateToken(),
	body("documentId").notEmpty().isUUID(),
	body("newDocumentName").notEmpty().isString().isLength({
		min: MIN_DOCUMENT_NAME_LENGTH,
		max: MAX_DOCUMENT_NAME_LENGTH,
	}),
	async (request: Request, response: Response) => {
		const result = validationResult(request);
		if (!result.isEmpty()) {
			return response.status(400).send({
				message: "validation error",
				errors: result.array(),
			});
		}

		if (!request.body.payload) {
			return response.status(500).send({
				message: "internal server error",
			});
		}

		const documentId = request.body.documentId;
		const newDocumentName = request.body.newDocumentName;
		const requester = request.body.payload.username;

		try {
			const document = (await getDocumentSQL(documentId))[0];

			if (document.owner !== requester) {
				return response.status(401).send({
					message: "unauthorized",
				});
			}

			await renameDocumentSQL(documentId, newDocumentName);

			return response.status(200).send({
				message: `success`,
			});
		} catch (error) {
			console.error(error);
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

service.put(
	"/api/document/save",
	validateToken(),
	body("uuid").notEmpty().isUUID(),
	body("content").notEmpty(),
	async (request: Request, response: Response) => {
		const result = validationResult(request);
		if (!result.isEmpty()) {
			return response.status(400).send({
				message: "validation error",
				errors: result.array(),
			});
		}

		if (!request.body.payload) {
			return response.status(500).send({
				message: "internal server error",
			});
		}

		const username: string = request.body.payload.username;
		const uuid: string = request.body.uuid;
		const content: IContent = request.body.content;

		try {
			const document = (await getDocumentSQL(uuid))[0];

			const permissions = (await getUsersWithPermissionSQL(uuid)).map(
				(entry) => entry.username,
			);

			if (
				document.owner !== username &&
				!permissions.includes(username)
			) {
				return response.status(401).send({
					message: "unauthorized",
				});
			}

			if (document.lockholder !== username) {
				return response.status(401).send({
					message: "unauthorized",
				});
			}

			await saveDocumentSQL(uuid, content);

			return response.status(200).send({
				message: `document '${document.name}' saved successfully`,
			});
		} catch (error) {
			console.error(error);
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

service.delete(
	"/api/document/permission",
	validateToken(),
	body("uuid").notEmpty().isUUID(),
	body("username").notEmpty().isString().isLength({
		min: MIN_NAME_LENGTH,
		max: MAX_NAME_LENGTH,
	}),
	async (request: Request, response: Response) => {
		const result = validationResult(request);
		if (!result.isEmpty()) {
			return response.status(400).send({
				message: "validation error",
				errors: result.array(),
			});
		}

		if (!request.body.payload) {
			return response.status(500).send({
				message: "internal server error",
			});
		}

		const owner: string = request.body.payload.username;
		const uuid: string = request.body.uuid;
		const username: string = request.body.username;

		if (owner === username) {
			return response.status(400).send({
				message: "bad request",
			});
		}

		try {
			const document = (await getDocumentSQL(uuid))[0];

			if (document.owner !== owner) {
				return response.status(401).send({
					message: "unauthorized",
				});
			}

			await removePermissionsSQL(uuid, username);

			return response.status(200).send({
				message: "success",
			});
		} catch (error) {
			console.log(error);
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

/* This delete path is unused. Ran out of time. Sadness */
/* It was for removing permissions to a document from another user */
service.delete<{ uuid: string }>(
	"/api/document/:uuid",
	validateToken(),
	async (request: Request<{ uuid: string }>, response: Response) => {
		if (!request.body.payload) {
			return response.status(500).send({
				message: "internal server error",
			});
		}

		const username = request.body.payload.username;
		const uuid = request.params.uuid;

		try {
			const document = (await getDocumentSQL(uuid))[0];

			if (!document) {
				return response.status(404).send({
					message: "document not found",
				});
			}

			if (document.owner !== username) {
				return response.status(401).send({
					message: "unauthorized",
				});
			}

			await deleteDocumentSQL(uuid);

			return response.status(200).send({
				message: `document '${document.name}' deleted successfully`,
			});
		} catch (error) {
			console.error(error);
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

service.post(
	"/api/document/permission",
	validateToken(),
	body("uuid").notEmpty().isUUID(),
	body("username").notEmpty().isString().isLength({
		min: MIN_NAME_LENGTH,
		max: MAX_NAME_LENGTH,
	}),
	async (request: Request, response: Response) => {
		const result = validationResult(request);
		if (!result.isEmpty()) {
			return response.status(400).send({
				message: "validation error",
				errors: result.array(),
			});
		}

		if (!request.body.payload) {
			return response.status(500).send({
				message: "internal server error",
			});
		}

		const owner: string = request.body.payload.username;
		const uuid: string = request.body.uuid;
		const username: string = request.body.username;

		if (owner === username) {
			return response.status(400).send({
				message: "bad request",
			});
		}

		try {
			const document = (await getDocumentSQL(uuid))[0];

			if (document.owner !== owner) {
				return response.status(401).send({
					message: "unauthorized",
				});
			}

			await addPermissionsSQL(uuid, username);

			return response.status(200).send({
				message: "success",
			});
		} catch (error) {
			console.log(error);
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

service.get(
	"/api/document/",
	validateToken(),
	async (request: Request, response: Response) => {
		if (!request.body.payload) {
			return response.status(500).send({
				message: "internal server error",
			});
		}

		const username: string = request.body.payload.username;

		try {
			const documents = await getAllDocumentsSQL(username);
			return response.status(200).send(documents);
		} catch (error) {
			console.error(error);
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

service.post(
	"/api/document/getlock/",
	validateToken(),
	body("documentId").notEmpty().isUUID(),
	async (request: Request, response: Response) => {
		const result = validationResult(request);
		if (!result.isEmpty()) {
			return response.status(400).send({
				message: "validation error",
				errors: result.array(),
			});
		}

		if (!request.body.payload) {
			return response.status(500).send({
				message: "internal server error",
			});
		}

		const username = request.body.payload.username;
		const documentId = request.body.documentId;

		try {
			const document = (await getDocumentSQL(documentId))[0];

			if (document.lockholder !== null) {
				return response.status(401).send({
					message: "lock held by someone else",
				});
			}

			await updateLockHolderSQL(documentId, username);

			return response.status(200).send({
				message: "success",
			});
		} catch (error) {
			console.error(error);
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

service.post(
	"/api/document/freelock/",
	validateToken(),
	body("documentId").notEmpty().isUUID(),
	async (request: Request, response: Response) => {
		console.log("freeing lock");
		const result = validationResult(request);
		if (!result.isEmpty()) {
			return response.status(400).send({
				message: "validation error",
				errors: result.array(),
			});
		}

		if (!request.body.payload) {
			return response.status(500).send({
				message: "internal server error",
			});
		}

		const username = request.body.payload.username;
		const documentId = request.body.documentId;

		try {
			const document = (await getDocumentSQL(documentId))[0];

			if (document.lockholder !== username) {
				return response.status(401).send({
					message: "lock held by someone else",
				});
			}

			await updateLockHolderSQL(documentId, null);

			return response.status(200).send({
				message: "success",
			});
		} catch (error) {
			console.error(error);
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

service.get<{ uuid: string }>(
	"/api/document/:uuid",
	async (request: Request<{ uuid: string }>, response: Response) => {
		const uuid: string = request.params.uuid;

		try {
			const document = (await getDocumentSQL(uuid))[0];
			const permissions = (await getUsersWithPermissionSQL(uuid)).map(
				(entry) => entry.username,
			);

			return response.status(200).send({
				document: document,
				permissions: permissions,
			});
		} catch (error) {
			console.error(error);
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

export default service;
