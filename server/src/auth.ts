import express, { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { body, validationResult } from "express-validator";

import config from "./config";
import { registerUserSQL, getUserSQL } from "./database";

const auth = Router();

auth.use(express.json());

const saltRounds = 10;

export const MIN_NAME_LENGTH = 3;
export const MAX_NAME_LENGTH = 64;

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;

auth.post(
	"/api/register",
	body("username").notEmpty().isString().isLength({
		min: MIN_NAME_LENGTH,
		max: MAX_NAME_LENGTH,
	}),
	body("password").notEmpty().isString().isLength({
		min: MIN_PASSWORD_LENGTH,
		max: MAX_PASSWORD_LENGTH,
	}),
	async (request: Request, response: Response) => {
		const results = validationResult(request);

		if (!results.isEmpty()) {
			return response.status(400).send({
				message: "validation error",
				errors: results.array(),
			});
		}

		const username: string = request.body.username;
		const password: string = request.body.password;

		try {
			const hash = await bcrypt.hash(password, saltRounds);

			await registerUserSQL(username, hash);

			return response.status(200).send({
				message: "user created successfully",
			});
		} catch (error) {
			console.error(error);
			return response.status(500).send({
				message: "internal server error",
				errors: [],
			});
		}
	},
);

interface IPayload extends JwtPayload {
	username: string;
}

auth.post(
	"/api/login",
	body("username").notEmpty().isString().isLength({
		min: MIN_NAME_LENGTH,
		max: MAX_NAME_LENGTH,
	}),
	body("password").notEmpty().isString().isLength({
		min: MIN_PASSWORD_LENGTH,
		max: MAX_PASSWORD_LENGTH,
	}),
	async (request: Request, response: Response) => {
		const results = validationResult(request);

		if (!results.isEmpty()) {
			return response.status(400).send({
				message: "validation error",
				errors: results.array(),
			});
		}

		const username: string = request.body.username;
		const password: string = request.body.password;

		try {
			const sqlResponse = (await getUserSQL(username))[0];

			console.log(sqlResponse);

			if (!(await bcrypt.compare(password, sqlResponse.password))) {
				return response.status(401).send({
					message: "unauthorized",
				});
			}

			const payload: IPayload = {
				username: username,
			};

			const token = jwt.sign(payload, config.secret);

			return response.status(200).send({
				username: username,
				token: token,
			});
		} catch (error) {
			console.error(error);
			return response.status(500).send({
				message: "internal server error",
				errors: [],
			});
		}
	},
);

export function validateToken(noEnforcement: boolean = false) {
	return (request: Request, response: Response, next: NextFunction) => {
		if (!request.headers.authorization) {
			if (noEnforcement) {
				next();
			}
			return response.status(400).send({
				message: "missing token",
			});
		}

		const authorization = request.headers.authorization;

		const BEARER_LENGTH = "Bearer".length;
		const schema = authorization.substring(0, BEARER_LENGTH);

		if (schema !== "Bearer") {
			return response.status(400).send({
				message: "invalid schema",
			});
		}

		const token = authorization.substring(BEARER_LENGTH + 1);

		if (!request.body) {
			request.body = {};
		}

		try {
			request.body.payload = jwt.verify(token, config.secret) as IPayload;
		} catch (error) {
			console.error(error);
			return response.status(401).send({
				message: "unauthorized",
			});
		}

		next();
	};
}

export default auth;
