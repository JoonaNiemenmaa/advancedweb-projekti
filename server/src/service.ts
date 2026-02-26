import { Router, Request, Response } from "express";
import { validateToken } from "./auth";
import {
	IContent,
	createDocumentSQL,
	getUserSQL,
	getDocumentSQL,
	deleteDocumentSQL,
	saveDocumentSQL,
	getOwnedDocumentsSQL,
} from "./database";
import { body, validationResult } from "express-validator";

const service = Router();

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 255;

service.post(
	"/api/document",
	validateToken,
	body("name").notEmpty().isString().isLength({
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

service.delete(
	"/api/document",
	validateToken,
	body("uuid").notEmpty().isUUID(),
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
		const uuid = request.body.uuid;

		try {
			const document = (await getDocumentSQL(uuid))[0];

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

service.put(
	"/api/document/rename",
	validateToken,
	(request: Request, response: Response) => {
		response.send("HELLO");
	},
);

service.put(
	"/api/document/save",
	validateToken,
	body("uuid").notEmpty().isUUID(),
	body("content").notEmpty().isJSON(),
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

			if (document.owner !== username) {
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

service.get(
	"/api/document/",
	validateToken,
	async (request: Request, response: Response) => {
		if (!request.body.payload) {
			return response.status(500).send({
				message: "internal server error",
			});
		}

		const username: string = request.body.payload.username;

		try {
			const documents = await getOwnedDocumentsSQL(username);
			return response.status(200).send(documents);
		} catch (error) {
			console.error(error);
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

interface IParams {
	uuid: string;
}

service.get<{ uuid: string }>(
	"/api/document/:uuid",
	validateToken,
	async (request: Request<IParams>, response: Response) => {
		if (!request.body.payload) {
			return response.status(500).send({
				message: "internal server error",
			});
		}

		const username: string = request.body.payload.username;
		const uuid: string = request.params.uuid;

		try {
			const document = (await getDocumentSQL(uuid))[0];

			if (document.owner !== username) {
				return response.status(401).send({
					message: "forbidden",
				});
			}

			return response.status(200).send(document);
		} catch (error) {
			return response.status(500).send({
				message: "internal server error",
			});
		}
	},
);

export default service;
