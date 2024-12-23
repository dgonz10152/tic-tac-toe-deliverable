import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";

export const signInWithGoogle = async () => {
	try {
		const result = await signInWithPopup(auth, provider);
		return result.user;
	} catch (error) {
		console.error("Error signing in:", error);
		throw error;
	}
};
