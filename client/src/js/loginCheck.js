export default function loginCheck() {
	if (!sessionStorage.getItem("token")) {
		window.location.replace("login");
	}
}
