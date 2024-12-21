import { useEffect, useState } from "react";
import db from "./firebase.js";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

function Square({ value, onSquareClick }) {
	return (
		<button className="square" onClick={onSquareClick}>
			{value}
		</button>
	);
}

async function saveGame(state, winner) {
	try {
		const docRef = await addDoc(collection(db, "games"), {
			squares: Array.isArray(state.squares) ? state.squares : [],
			winner: typeof winner === "string" ? winner : null,
		});
		console.log("Written with ID:", docRef.id);
	} catch (e) {
		console.error(e.message);
	}
}

async function getWinCounts() {
	try {
		const docRef = collection(db, "games");

		// Queries for games won by X and O
		const q1 = query(docRef, where("winner", "==", "X"));
		const q2 = query(docRef, where("winner", "==", "O"));

		// Fetching documents for each query
		const [q1Snap, q2Snap] = await Promise.all([getDocs(q1), getDocs(q2)]);

		// Return the counts
		return [q1Snap.size, q2Snap.size];
	} catch (e) {
		console.error("Error fetching win counts:", e.message);
		return [0, 0];
	}
}

export default function Board() {
	const [state, setState] = useState({
		squares: Array(9).fill(null),
		xIsNext: true,
	});
	const [won, setWon] = useState(false);

	const [xWins, setXWins] = useState(0);
	const [oWins, setOWins] = useState(0);

	useEffect(() => {
		async function fetchWins() {
			try {
				console.log("Fetching wins...");
				const [xCount, oCount] = await getWinCounts();
				console.log("Fetched counts:", xCount, oCount);
				setXWins(xCount);
				setOWins(oCount);
			} catch (e) {
				console.error("Error in fetchWins:", e.message);
			}
		}
		fetchWins();
	}, []);

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
				return squares[a];
			}
		}
		return null;
	}
	const winner = calculateWinner(state.squares);

	let status;
	if (winner) {
		if (!won) {
			saveGame(state, winner);
			setWon(true);
		}
		status = "Winner: " + winner;
	} else {
		status = "Next player: " + (state.xIsNext ? "X" : "O");
	}

	function handleClick(i) {
		if (state.squares[i] || calculateWinner(state.squares)) {
			return;
		}
		const nextSquares = state.squares.slice();
		if (state.xIsNext) {
			nextSquares[i] = "X";
		} else {
			nextSquares[i] = "O";
		}
		setState({ squares: nextSquares, xIsNext: !state.xIsNext });
	}

	return (
		<>
			<div className="status">
				X: {xWins} O: {oWins}
			</div>

			<div className="status">{status}</div>

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
			{won ? (
				<a href="/">
					{" "}
					<button>Play Again?</button>
				</a>
			) : null}
		</>
	);
}
