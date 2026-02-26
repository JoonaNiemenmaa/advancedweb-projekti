import "../scss/styles.scss";

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

const tableBody = document.getElementById("tableBody");

function addDocumentRow(document) {}

async function displayDocuments() {
	const documents = await fetchDocuments();

	for (const document of documents) {
		addDocumentRow(document);
	}
}

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
	} catch (error) {
		console.error(error);
	}
});
