# Tic-Tac-Toe with Firebase Integration

This is a Tic-Tac-Toe web application with Google authentication and Firebase Firestore integration. It tracks user-specific game history and win counts for both players, "X" and "O."

## Features

- **Interactive Gameplay**: Play Tic-Tac-Toe with an intuitive interface.
- **Google Authentication**: Sign in with Google to save and retrieve game history.
- **Firestore Integration**:
  - Store game results, including the winner, user, and timestamp.
  - Retrieve win counts for "X" and "O."
  - Fetch and preview the game history of signed-in users.
- **Game Replay**: View and replay previous games from history.

## Technologies Used

- **Frontend**: React.js
- **Backend**: Firebase Firestore for database and Google Authentication

## Setup Instructions

### Prerequisites

1. Node.js and npm installed.
2. A Firebase project set up with Firestore and Authentication enabled.
3. Firebase SDK configured in the `firebase.js` file.

### Installation

1. Clone this repository:
   git clone [https://github.com/dgonz10152/tic-tac-toe-deliverable.git]
   cd tic-tac-toe-firebase
2. Install dependencies:
   bash
   Copy code
   `npm install`
3. Configure .env:
   - Add your Firebase configuration in the `.env` file:
   ```
   REACT_APP_API_KEY=
   REACT_APP_AUTH_DOMAIN=
   REACT_APP_PROJECT_ID=
   REACT_APP_PROJECT_BUCKET=
   REACT_APP_MESSANGING_SENDER_ID=
   REACT_APP_APP_ID=
   ```
4. Start the development server:
   `npm start`
