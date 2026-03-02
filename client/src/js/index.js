import "../scss/styles.scss";
import * as bootstrap from "bootstrap";

const tableBody = document.getElementById("tableBody");

const settingsModalNode = document.getElementById("settingsModal");
const settingsModal = new bootstrap.Modal(settingsModalNode);

const settingsModalTitle = document.getElementById("settingsModalTitle");
const renameDocumentForm = document.getElementById("renameDocumentForm");
const newDocumentName = document.getElementById("newDocumentName");

const addPermissionsForm = document.getElementById("addPermissionsForm");
const givePermissionInput = document.getElementById("givePermissionInput");

function deleteDocument(tr, textDocument) {
	return async (event) => {
		const url = `http://localhost:3000/api/document/${textDocument.id}`;
		const options = {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		};

		const response = await fetch(url, options);

		const json = await response.json();

		console.log(response.status);
		console.log(json);

		if (response.status === 200) {
			tr.remove();
		}
	};
}

function createButtons(tr, textDocument) {
	const editBtn = document.createElement("button");
	editBtn.classList.add("btn", "btn-outline-primary", "p-1", "mx-1");
	editBtn.innerText = "edit";

	editBtn.addEventListener("click", (event) => {
		window.location.replace(`/edit?uuid=${textDocument.id}`);
	});

	const deleteBtn = document.createElement("button");
	deleteBtn.classList.add("btn", "btn-outline-danger", "p-1", "mx-1");
	deleteBtn.innerText = "delete";

	deleteBtn.addEventListener("click", deleteDocument(tr, textDocument));

	const settingsBtn = document.createElement("button");
	settingsBtn.classList.add("btn", "btn-outline-primary", "p-1", "mx-1");
	settingsBtn.innerText = "settings";

	settingsBtn.addEventListener("click", (event) => {
		settingsModalTitle.innerText = `Settings for '${textDocument.name}'`;

		async function renameDocumentFormHandler(event) {
			event.preventDefault();

			const url = "http://localhost:3000/api/document/rename";
			const options = {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					documentId: textDocument.id,
					newDocumentName: newDocumentName.value,
				}),
			};

			const response = await fetch(url, options);

			console.log(`${response.status} ${response.statusText}`);

			const json = await response.json();

			console.log(json);

			if (response.status === 200) {
				newDocumentName.value = "";
				displayDocuments();
				settingsModal.hide();
			}
		}

		renameDocumentForm.addEventListener(
			"submit",
			renameDocumentFormHandler,
		);

		async function addPermissionsFormHandler(event) {
			event.preventDefault();

			const url = "http://localhost:3000/api/document/permission";
			const options = {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					uuid: textDocument.id,
					username: givePermissionInput.value,
				}),
			};

			const response = await fetch(url, options);

			console.log(`${response.status} ${response.statusText}`);

			const json = await response.json();

			console.log(json);

			if (response.status === 200) {
				givePermissionInput.value = "";
			}
		}

		addPermissionsForm.addEventListener(
			"submit",
			addPermissionsFormHandler,
		);

		settingsModal.show();

		const cleanup = (event) => {
			renameDocumentForm.removeEventListener(
				"submit",
				renameDocumentFormHandler,
			);
			addPermissionsForm.removeEventListener(
				"submit",
				addPermissionsFormHandler,
			);

			settingsModalNode.removeEventListener("hidden.bs.modal", cleanup);
		};

		settingsModalNode.addEventListener("hidden.bs.modal", cleanup);
	});

	const buttons = document.createElement("td");
	buttons.appendChild(editBtn);
	buttons.appendChild(settingsBtn);
	buttons.appendChild(deleteBtn);

	return buttons;
}

function addDocumentRow(textDocument) {
	const owner = document.createElement("td");
	owner.innerText = textDocument.owner;

	const documentName = document.createElement("td");
	documentName.innerText = textDocument.name;

	const tr = document.createElement("tr");

	const buttons = createButtons(tr, textDocument);

	tr.appendChild(owner);
	tr.appendChild(documentName);
	tr.appendChild(buttons);

	tableBody.appendChild(tr);
}

async function fetchDocuments() {
	const url = "http://localhost:3000/api/document";
	const options = {
		headers: {
			Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		},
	};
	const response = await fetch(url, options);
	const json = await response.json();

	return json;
}

async function displayDocuments() {
	tableBody.innerHTML = "";
	const documents = await fetchDocuments();

	for (const textDocument of documents) {
		addDocumentRow(textDocument);
	}
}

displayDocuments();

const createDocument = document.getElementById("createDocument");

const documentName = document.getElementById("documentName");

createDocument.addEventListener("submit", async (event) => {
	event.preventDefault();

	const url = "http://localhost:3000/api/document";

	const options = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: documentName.value,
		}),
	};

	try {
		const response = await fetch(url, options);

		console.log(response.status);

		const json = await response.json();

		console.log(json);
		if (response.status === 200) {
			displayDocuments();
		}
	} catch (error) {
		console.error(error);
	}
});
