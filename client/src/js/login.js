import "../scss/styles.scss";

const loginForm = document.getElementById("loginForm");

const username = document.getElementById("username");
const password = document.getElementById("password");

const responseText = document.getElementById("responseText");

loginForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const url = "http://localhost:3000/api/login";

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
			sessionStorage.setItem("username", json.username);
			sessionStorage.setItem("token", json.token);

			window.location.replace("/");
		}
	} catch (error) {
		console.error(error);
	}
});
