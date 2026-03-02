import "../scss/styles.scss";
import * as bootstrap from "bootstrap";

import EditorJS from "@editorjs/editorjs";

async function getLock(documentId) {
	console.log("obtaining lock");
	const url = `http://localhost:3000/api/document/getlock`;
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			authorization: `Bearer ${sessionStorage.getItem("token")}`,
		},
		body: JSON.stringify({
			documentId: documentId,
		}),
		keepalive: true,
	};

	const response = await fetch(url, options);
	console.log(`${response.status} ${response.statusText}`);

	const json = await response.json();
	console.log(json);

	return response;
}

async function freeLock(documentId) {
	const url = `http://localhost:3000/api/document/freelock`;
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			authorization: `Bearer ${sessionStorage.getItem("token")}`,
		},
		body: JSON.stringify({
			documentId: documentId,
		}),
	};

	const response = await fetch(url, options);
	console.log(`${response.status} ${response.statusText}`);

	const json = await response.json();
	console.log(json);

	json.document.content = JSON.parse(json.document.content);

	return { response, json };
}

async function fetchDocument(documentId) {
	console.log("fetching document");
	const url = `http://localhost:3000/api/document/${documentId}`;

	const response = await fetch(url);
	console.log(`${response.status} ${response.statusText}`);

	const json = await response.json();
	console.log(json);

	json.document.content = JSON.parse(json.document.content);

	return { response, json };
}

function findUser(username, permissions) {
	for (const user of permissions) {
		if (username === user.username) {
			return true;
		}
	}
	return false;
}

async function main() {
	const params = new URLSearchParams(window.location.search);
	const documentId = params.get("uuid");

	window.addEventListener("pagehide", (event) => {
		freeLock(documentId);
	});

	try {
		const lockResponse = await getLock(documentId);

		const { response, json } = await fetchDocument(documentId);

		const currentUser = sessionStorage.getItem("username");

		let readOnly = true;

		try {
			readOnly =
				json.document.owner !== currentUser &&
				!json.permissions.includes(currentUser);
			if (lockResponse.status !== 200) {
				readOnly = true;
			}
		} catch (error) {
			console.error(error);
		}

		if (response.status === 200) {
			const editor = new EditorJS({
				holder: "editor",
				readOnly: readOnly,
				data: json.document.content,
			});

			const saveBtn = document.getElementById("saveBtn");

			saveBtn.addEventListener("click", async (event) => {
				const url = "http://localhost:3000/api/document/save";
				const options = {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
					body: JSON.stringify({
						uuid: documentId,
						content: await editor.save(),
					}),
				};
				const response = await fetch(url, options);
				const json = await response.json();

				console.log(`${response.status} ${response.statusText}`);
				console.log(json);
			});
		}
	} catch (error) {
		console.error(error);
	}
}

main();
