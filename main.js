import readline from "readline";
import rooms from "./data/world.json" assert { type: "json" };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getInput() {
  return new Promise((resolve) =>
    rl.question("> ", (answer) => resolve(answer))
  );
}

const state = {
  quit: false,
  currentRoom: 1,
};

function renderExits(exits) {
  return `Exits: [ ${
    exits
      ? Object.keys(exits)
          .map((name) => name)
          .join(" ")
      : "None"
  } ]`;
}

function displayRoom({ name, description, exits }) {
  console.log(name);
  console.log(description);
  console.log();
  console.log(renderExits(exits));
}

let room = null;

const commands = {
  look() {
    if (room) displayRoom(room);
  },
  quit() {
    rl.close();
    state.quit = true;
  },
};

function chopFirstWord(sentence) {
  sentence = sentence.trim();
  const spaceIndex = sentence.indexOf(" ");
  if (spaceIndex === -1) return { firstWord: sentence };
  return {
    firstWord: sentence.slice(0, spaceIndex),
    remainder: sentence.substring(spaceIndex + 1).trim(),
  };
}

function findExit({ exits }, searchText) {
  if (!exits) return;
  searchText = searchText.toLowerCase();
  const [, exit] =
    Object.entries(exits).find(([name]) =>
      name.toLowerCase().startsWith(searchText)
    ) || [];
  return exit;
}

while (!state.quit) {
  const { currentRoom, lastRoom } = state;
  if (currentRoom !== lastRoom) {
    room = rooms[currentRoom];
    displayRoom(room);
    state.lastRoom = currentRoom;
  }

  const input = await getInput();
  const { firstWord, remainder } = chopFirstWord(input);

  const exit = findExit(room, firstWord);
  if (exit) {
    state.currentRoom = exit.to;
    continue;
  }

  const [, handler] =
    Object.entries(commands).find(([command]) =>
      command.toLowerCase().startsWith(firstWord.toLowerCase())
    ) || [];

  if (!handler) {
    console.log(`Sorry, I didn't understand '${firstWord}'.`);
    continue;
  }

  handler(remainder);
}
