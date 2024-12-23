import { useEffect, useState } from "react";
import { db } from "./firebase.js"; // Import Firestore database instance
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { signInWithGoogle } from "./auth.js"; // Import authentication functions

// Square component represents a single square in the Tic-Tac-Toe grid
function Square({ value, onSquareClick }) {
	return (
		<button className="square" onClick={onSquareClick}>
			{value}
		</button>
	);
}

// Saves the game data to Firestore
async function saveGame(state, winner, user) {
	try {
		// Add a new document to the 'games' collection
		const docRef = await addDoc(collection(db, "games"), {
			squares: Array.isArray(state.squares) ? state.squares : [],
			winner: typeof winner === "string" ? winner : null,
			user: typeof user.uid === "string" ? user.uid : null, // Ensure the user ID is valid
			date: Date.now(),
		});
		console.log("Written with ID:", docRef.id); // Log the document ID
	} catch (e) {
		console.error(e.message); // Handle and log errors
	}
}

// Retrieves the count of wins for "X" and "O"
async function getWinCounts() {
	try {
		const docRef = collection(db, "games"); // Reference the 'games' collection

		// Create Firestore queries for games won by "X" and "O"
		const q1 = query(docRef, where("winner", "==", "X"));
		const q2 = query(docRef, where("winner", "==", "O"));

		// Execute both queries in parallel
		const [q1Snap, q2Snap] = await Promise.all([getDocs(q1), getDocs(q2)]);

		// Return the counts of documents matching each query
		return [q1Snap.size, q2Snap.size];
	} catch (e) {
		console.error("Error fetching win counts:", e.message);
		return [0, 0]; // Default counts on error
	}
}

// Retrieves all games played by a specific user
async function getGames(uid) {
	try {
		let games = []; // Array to hold the retrieved games
		const docRef = collection(db, "games");

		// Query Firestore for games played by the specified user
		const uidQuery = query(docRef, where("user", "==", uid));
		const snap = await getDocs(uidQuery);

		// Extract data and document IDs from the query snapshot
		snap.forEach((doc) => {
			games.push({ data: doc.data(), id: doc.id });
		});

		return games; // Return the list of games
	} catch (e) {
		console.error(e.message); // Handle and log errors
		return []; // Return an empty list on error
	}
}

export default function Page() {
	const [user, setUser] = useState(null); // Stores the authenticated user
	const [games, setGames] = useState(); // Stores the user's game history
	const [previewing, setPreviewing] = useState(false);

	// Handles Google sign-in and retrieves user's games
	const handleSignIn = async () => {
		try {
			const loggedInUser = await signInWithGoogle(); // Sign in the user
			const gotGames = (await getGames(loggedInUser.uid)).sort(); // Fetch games for the user
			setUser(loggedInUser); // Set the logged-in user
			setGames(gotGames); // Set the user's game history
		} catch (error) {
			console.error("Sign-in failed", error); // Handle and log errors
		}
	};

	const [state, setState] = useState({
		squares: Array(9).fill(null), // Initial state for the Tic-Tac-Toe board
		xIsNext: true, // Tracks which player's turn it is
	});
	const [won, setWon] = useState(false); // Tracks whether the game has been won

	const [xWins, setXWins] = useState(0); // Stores the win count for "X"
	const [oWins, setOWins] = useState(0); // Stores the win count for "O"

	// Fetch win counts on component mount
	useEffect(() => {
		async function fetchWins() {
			try {
				console.log("Fetching wins...");
				const [xCount, oCount] = await getWinCounts(); // Retrieve win counts
				console.log("Fetched counts:", xCount, oCount);
				setXWins(xCount); // Update "X" win count
				setOWins(oCount); // Update "O" win count
			} catch (e) {
				console.error("Error in fetchWins:", e.message); // Handle and log errors
			}
		}
		fetchWins();
	}, []);

	// Calculates the winner of the game
	function calculateWinner(squares) {
		const lines = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		];
		for (let i = 0; i < lines.length; i++) {
			const [a, b, c] = lines[i];
			if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
				return squares[a]; // Return the winner ("X" or "O")
			}
		}
		return null; // Return null if no winner
	}

	const winner = calculateWinner(state.squares);

	let status;

	if (winner) {
		if (!won && !previewing) {
			saveGame(state, winner, user); // Save the game result to Firestore
			setWon(true); // Mark the game as won
		}
		status = "Winner: " + winner; // Display the winner
	} else {
		status = "Next player: " + (state.xIsNext ? "X" : "O"); // Display the next player
	}

	// Handles square clicks during the game
	function handleClick(i) {
		if (state.squares[i] || calculateWinner(state.squares)) {
			return; // Ignore clicks on already played squares or if the game is over
		}
		const nextSquares = state.squares.slice(); // Create a copy of the squares
		if (state.xIsNext) {
			nextSquares[i] = "X"; // Mark the square for "X"
		} else {
			nextSquares[i] = "O"; // Mark the square for "O"
		}
		setState({ squares: nextSquares, xIsNext: !state.xIsNext }); // Update the game state
	}

	return (
		<>
			{/* Display sign-in or user's name */}
			<div className="status">
				{user ? (
					user.displayName
				) : (
					<div>
						<button onClick={handleSignIn}>Sign In</button>
					</div>
				)}
			</div>

			{/* Display win counts */}
			<div className="status">
				X: {xWins} O: {oWins}
			</div>

			{/* Display game status */}
			<div className="status">{status}</div>

			{/* Render the Tic-Tac-Toe board */}
			<div className="board-row">
				<Square value={state.squares[0]} onSquareClick={() => handleClick(0)} />
				<Square value={state.squares[1]} onSquareClick={() => handleClick(1)} />
				<Square value={state.squares[2]} onSquareClick={() => handleClick(2)} />
			</div>
			<div className="board-row">
				<Square value={state.squares[3]} onSquareClick={() => handleClick(3)} />
				<Square value={state.squares[4]} onSquareClick={() => handleClick(4)} />
				<Square value={state.squares[5]} onSquareClick={() => handleClick(5)} />
			</div>
			<div className="board-row">
				<Square value={state.squares[6]} onSquareClick={() => handleClick(6)} />
				<Square value={state.squares[7]} onSquareClick={() => handleClick(7)} />
				<Square value={state.squares[8]} onSquareClick={() => handleClick(8)} />
			</div>

			{/* Play Again button if the game is won */}
			{won | previewing ? (
				<button
					onClick={async () => {
						if (user) {
							let pastGames = await getGames(user.uid);
							console.log(pastGames);
							setGames(pastGames);
						}
						setState({
							squares: Array(9).fill(null),
							xIsNext: true,
						});
						setWon(false);
						setPreviewing(false);
					}}
				>
					Play Again?
				</button>
			) : null}

			{/* Display past games */}
			<div className="status">
				{games != null ? (
					<div>
						<h1>Past Games</h1>
						{games.map((game) => (
							<li key={game.id}>
								<button
									onClick={() => {
										setState({ squares: game.data.squares, xIsNext: false });
										setPreviewing(true);
									}}
								>
									{new Date(game.data.date).toLocaleString()}
								</button>
							</li>
						))}
					</div>
				) : (
					<p>No games found</p>
				)}
			</div>
		</>
	);
}
