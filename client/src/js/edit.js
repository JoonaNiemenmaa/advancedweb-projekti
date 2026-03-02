import "../scss/styles.scss";
import * as bootstrap from "bootstrap";

import EditorJS from "@editorjs/editorjs";

async function fetchDocument(uuid) {
	const url = `http://localhost:3000/api/document/${uuid}`;

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
	const uuid = params.get("uuid");

	try {
		const { response, json } = await fetchDocument(uuid);

		const currentUser = sessionStorage.getItem("username");

		let readOnly = true;

		try {
			readOnly =
				json.document.owner !== currentUser &&
				!json.permissions.includes(currentUser);
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
						uuid: uuid,
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
