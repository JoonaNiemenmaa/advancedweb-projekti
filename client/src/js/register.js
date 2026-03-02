import "../scss/styles.scss";
import * as bootstrap from "bootstrap";

const registerForm = document.getElementById("registerForm");

const username = document.getElementById("username");
const password = document.getElementById("password");

const responseText = document.getElementById("responseText");

registerForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const url = "http://localhost:3000/api/register";

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: username.value,
			password: password.value,
		}),
	};

	try {
		const response = await fetch(url, options);

		console.log(response.status);

		const json = await response.json();

		console.log(json);

		responseText.innerText = json.message;

		if (response.status === 200) {
			window.location.replace("login");
		}
	} catch (error) {
		console.error(error);
	}
});
