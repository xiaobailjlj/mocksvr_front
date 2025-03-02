import React, { useState, useEffect } from 'react';
import { config } from './config';

// Main Boardgame Component
const BoardgameServerApp: React.FC = () => {
    const [currentView, setCurrentView] = useState<'selector' | 'game'>('selector');
    const [gameData, setGameData] = useState<any>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [roundNumber, setRoundNumber] = useState<number>(1);
    const urlPrefix = config.boardgameUrl;

    const handleGameGeneration = (formData: any) => {
        setLoading(true);
        fetch(`${urlPrefix}/api/v1/rules/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                setGameData(data);
                setCurrentView('game');
                setLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false);
            });
    };

    return (
        <div className="flex flex-col w-full h-full">
            {loading && <LoadingIndicator />}
            {currentView === 'selector' && (
                <GameSelector onSubmit={handleGameGeneration} />
            )}
            {currentView === 'game' && gameData && (
                <GamePlay
                    gameData={gameData}
                    selectedCharacter={selectedCharacter}
                    setSelectedCharacter={setSelectedCharacter}
                    roundNumber={roundNumber}
                    setRoundNumber={setRoundNumber}
                />
            )}
        </div>
    );
};

// Game Selector Form Component
const GameSelector: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
    const [players, setPlayers] = useState<number>(2);
    const [time, setTime] = useState<number>(30);
    const [type, setType] = useState<string>('');
    const [backgroundDescription, setBackgroundDescription] = useState<string>('');
    const [selectedMechanics, setSelectedMechanics] = useState<string[]>([]);

    const gameTypes = [
        'adventure', 'territory building', 'civilization', 'exploration',
        'fantasy', 'economic', 'farming industry manufacturing',
        'fighting', 'bluffing'
    ];

    const mechanics = [
        'Action and Turn Management', 'Card Play', 'Dice and Randomness',
        'Player Interaction', 'Progression and Development', 'Resource and Area Management'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!players || !time || !type || selectedMechanics.length === 0 || !backgroundDescription) {
            alert('Please fill out all fields.');
            return;
        }

        onSubmit({
            number_of_players: players,
            game_duration: `${time} minutes`,
            description_of_background: backgroundDescription,
            game_category: type,
            game_mechanics: selectedMechanics
        });
    };

    const toggleMechanic = (mechanic: string) => {
        if (selectedMechanics.includes(mechanic)) {
            setSelectedMechanics(selectedMechanics.filter(m => m !== mechanic));
        } else {
            setSelectedMechanics([...selectedMechanics, mechanic]);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-full bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Game Selector</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block font-bold mb-1" htmlFor="players">
                            Number of Players:
                        </label>
                        <input
                            type="number"
                            id="players"
                            className="w-full p-2 border rounded"
                            value={players}
                            onChange={(e) => setPlayers(parseInt(e.target.value))}
                            min={2}
                            max={5}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-bold mb-1" htmlFor="time">
                            Play Time (minutes):
                        </label>
                        <input
                            type="number"
                            id="time"
                            className="w-full p-2 border rounded"
                            value={time}
                            onChange={(e) => setTime(parseInt(e.target.value))}
                            min={5}
                            max={180}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-bold mb-1" htmlFor="type">
                            Game Type:
                        </label>
                        <select
                            id="type"
                            className="w-full p-2 border rounded"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select a type</option>
                            {gameTypes.map((gameType) => (
                                <option key={gameType} value={gameType}>{gameType}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block font-bold mb-1">Mechanics:</label>
                        <div className="flex flex-wrap">
                            {mechanics.map((mechanic) => (
                                <button
                                    key={mechanic}
                                    type="button"
                                    className={`m-1 px-3 py-1 text-sm rounded-md ${
                                        selectedMechanics.includes(mechanic)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                    onClick={() => toggleMechanic(mechanic)}
                                >
                                    {mechanic}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-sm">
                            Selected Mechanics: {selectedMechanics.length ? selectedMechanics.join(', ') : 'None'}
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block font-bold mb-1" htmlFor="background-description">
                            Background Description:
                        </label>
                        <textarea
                            id="background-description"
                            className="w-full p-2 border rounded"
                            rows={4}
                            value={backgroundDescription}
                            onChange={(e) => setBackgroundDescription(e.target.value)}
                            placeholder="Describe the background of the game"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full p-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
                    >
                        Generate Game
                    </button>
                </form>
            </div>
        </div>
    );
};

// Game Play Component
const GamePlay: React.FC<{
    gameData: any;
    selectedCharacter: any;
    setSelectedCharacter: React.Dispatch<React.SetStateAction<any>>;
    roundNumber: number;
    setRoundNumber: React.Dispatch<React.SetStateAction<number>>;
}> = ({ gameData, selectedCharacter, setSelectedCharacter, roundNumber, setRoundNumber }) => {
    const [currentView, setCurrentView] = useState<'characterSelect' | 'gameplay'>(
        'characterSelect'
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [players, setPlayers] = useState<any[]>([]);
    const [actions, setActions] = useState<[string, string][]>([]);
    const [gameLog, setGameLog] = useState<{message: string, type: string}[]>([]);
    const [dynamicMessage, setDynamicMessage] = useState<string>('');
    const urlPrefix = '';

    useEffect(() => {
        // If character is selected and view is game, initialize the game
        if (selectedCharacter && currentView === 'gameplay') {
            initializeGame();
            startGame();
        }
    }, [selectedCharacter, currentView]);

    const initializeGame = () => {
        if (!selectedCharacter) return;

        const playersCount = gameData.players.number_of_players;
        const playerPositions: any = {
            2: [
                { class: 'you', x: '40%', y: '70%' },
                { class: 'ai1', x: '40%', y: '0%' }
            ],
            3: [
                { class: 'you', x: '40%', y: '70%' },
                { class: 'ai1', x: '0%', y: '0%' },
                { class: 'ai2', x: '80%', y: '0%' }
            ],
            4: [
                { class: 'you', x: '40%', y: '70%' },
                { class: 'ai1', x: '0%', y: '40%' },
                { class: 'ai2', x: '80%', y: '40%' },
                { class: 'ai3', x: '40%', y: '0%' }
            ],
            5: [
                { class: 'you', x: '40%', y: '70%' },
                { class: 'ai1', x: '0%', y: '40%' },
                { class: 'ai2', x: '80%', y: '40%' },
                { class: 'ai3', x: '0%', y: '0%' },
                { class: 'ai4', x: '80%', y: '0%' }
            ]
        };

        // Define available characters (excluding selected character)
        const availableCharacters = (gameData.players.roles ||
            gameData.players.Roles ||
            gameData.players.character_roles).filter(
            (char: any) => char.name !== selectedCharacter.name
        );

        const newPlayers = playerPositions[playersCount].map((pos: any, index: number) => {
            if (pos.class === 'you') {
                return {
                    ...pos,
                    name: 'You',
                    character: selectedCharacter.name,
                    image: selectedCharacter.image
                };
            } else {
                const randomCharIndex = Math.floor(Math.random() * availableCharacters.length);
                const character = availableCharacters.splice(randomCharIndex, 1)[0];
                return {
                    ...pos,
                    name: character.name,
                    character: character.name,
                    image: character.image
                };
            }
        });

        setPlayers(newPlayers);
    };

    const startGame = () => {
        setLoading(true);
        fetch(`${urlPrefix}/api/v1/gameplay/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rule_id: gameData.rule_id,
                player_role: selectedCharacter.name
            })
        })
            .then(response => response.json())
            .then(startData => {
                const numberedActions = Object.entries(startData.next_action)
                    .filter(([key]) => /^choice[_ ]\d+$/.test(key)) as [string, string][];

                setActions(numberedActions);
                setDynamicMessage(startData.next_action.choose + '⏳');

                addLogEntry('Game started', 'system');
                addLogEntry('Welcome to the adventure!', 'system');
                addLogEntry(`Game started with ${selectedCharacter.name} character`, 'system');
                addLogEntry('Your turn to choose an activity', 'system');

                setLoading(false);
            })
            .catch(err => {
                console.error('Error starting game:', err);
                setLoading(false);
            });
    };

    const handleAction = (actionKey: string, actionText: string) => {
        addLogEntry(`User chose to ${actionText}`, 'my-player');
        setLoading(true);

        fetch(`${urlPrefix}/api/v1/gameplay/round`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rule_id: gameData.rule_id,
                player_role: selectedCharacter.name,
                round_id: roundNumber,
                action: 'User chose to ' + actionKey
            })
        })
            .then(response => response.json())
            .then(roundData => {
                // Parse next actions
                const numberedActions = Object.entries(roundData.next_action)
                    .filter(([key]) => /^choice[_ ]\d+$/.test(key)) as [string, string][];
                setActions(numberedActions);

                // Process history entries for the log
                if (roundData.history && roundData.history[roundData.history.length - 1]) {
                    const historyData = roundData.history[roundData.history.length - 1];

                    // Process actions
                    if (historyData.actions) {
                        extractLogEntries(historyData.actions, 'system');
                    }

                    // Process events
                    if (historyData.events) {
                        extractLogEntries(historyData.events, 'event');
                    }
                }

                addLogEntry(`Round ${roundNumber} completed`, 'system');

                // Check if game should restart (round limit)
                if (roundNumber >= 10) {
                    showGameMessage(`Reaching Round Limit ${roundNumber}`, true);
                    setTimeout(() => {
                        // Reset the game (in a real app, you might navigate back to selector)
                        window.location.reload();
                    }, 2000);
                } else {
                    showGameMessage('Round Complete!', false);
                    setRoundNumber(prev => prev + 1);
                }

                setLoading(false);
            })
            .catch(err => {
                console.error('Error during round:', err);
                setLoading(false);
            });
    };

    const extractLogEntries = (obj: any, type: string) => {
        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
                extractLogEntries(obj[key], type);
            } else if (key === 'description') {
                addLogEntry(obj[key], type);
            } else if (key === 'result') {
                addLogEntry(obj[key], 'result');
            }
        }
    };

    const addLogEntry = (message: string, type: string) => {
        setGameLog(prev => [...prev, { message, type }]);
    };

    const showGameMessage = (message: string, isError: boolean) => {
        // In a real implementation, you would show a floating message
        // This is a simplified version
        console.log(message);
    };

    const startGameWithCharacter = () => {
        if (selectedCharacter) {
            setCurrentView('gameplay');
        }
    };

    // Character Selection view
    if (currentView === 'characterSelect') {
        return (
            <CharacterSelection
                gameData={gameData}
                onSelectCharacter={setSelectedCharacter}
                selectedCharacter={selectedCharacter}
                onStartGame={startGameWithCharacter}
            />
        );
    }

    const myPlayer = players.find(p => p.class === 'you');

    return (
        <div className="flex h-full">
            {/* Rules Sidebar */}
            <div className="w-96 bg-amber-950 h-full relative overflow-hidden shadow-lg">
                <div className="absolute inset-5 bg-amber-100 rounded-lg overflow-hidden shadow-inner">
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-amber-100 to-amber-200"></div>
                    <div className="p-5 h-full overflow-y-auto text-amber-950">
                        <h2 className="text-xl font-bold text-center mb-4 text-amber-800">Game Rules</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold">Background</h3>
                                <p>{gameData.background}</p>
                            </div>
                            <div>
                                <h3 className="font-bold">Rules</h3>
                                <RulesList rules={gameData.rules} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Game Area */}
            <div className="flex-1 flex flex-col bg-gray-800 text-white relative">
                {/* Game Title */}
                <div className="w-full text-center p-4 bg-gradient-to-b from-gray-800 to-transparent">
                    <div className="inline-block relative">
                        <h1 className="text-2xl font-bold text-white px-6 py-2 border-b-4 border-double border-opacity-30 border-white">
                            {gameData.name}
                        </h1>
                        <div className="absolute inset-0 pointer-events-none">
                            <span className="absolute text-2xl top-0 right-0">🎲</span>
                            <span className="absolute text-2xl bottom-0 left-0">🌀</span>
                        </div>
                        <div className="text-sm italic text-white opacity-80 mt-1">A Tale of Strategy & Fortune</div>
                    </div>
                </div>

                {/* Game Board */}
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-4/5 h-64 bg-cover bg-center border-4 border-white rounded-lg relative"
                         style={{ backgroundImage: `url('./static/mappractice3.jpg')` }}>
                        {players.map((player, index) => (
                            <div
                                key={index}
                                className="w-20 h-20 border-2 border-white rounded-full flex items-center justify-center text-sm bg-black bg-opacity-60 absolute"
                                style={{
                                    left: player.x,
                                    top: player.y,
                                    backgroundImage: player.image,
                                    backgroundSize: 'cover'
                                }}
                            >
                                {player.name}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <h2 className="text-xl font-bold">{myPlayer ? `You are ${myPlayer.character}` : ''}</h2>
                        <p>{dynamicMessage}</p>
                    </div>

                    {/* Actions Buttons */}
                    <div className="mt-6 space-y-2">
                        {actions.map(([key, text], index) => (
                            <div key={index} className="flex items-center">
                                <p className="mr-2">{text}</p>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    onClick={() => handleAction(key, text)}
                                >
                                    🎮
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Game Log Sidebar */}
            <div className="w-96 bg-gray-900 h-full relative overflow-hidden shadow-lg">
                <div className="absolute inset-5 bg-black border-4 border-gray-700 rounded overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 text-center font-mono uppercase text-sm tracking-wider text-white border-b-2 border-gray-600">
                        Game Log
                    </div>
                    <div className="p-4 h-full overflow-y-auto text-green-400 font-mono text-sm">
                        {gameLog.map((entry, index) => (
                            <div
                                key={index}
                                className={`my-2 p-1 border-l-2 ${getLogEntryClass(entry.type)}`}
                            >
                <span className="text-gray-500 text-xs mr-2">
                  {new Date().toLocaleTimeString()}
                </span>
                                {entry.message}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {loading && <LoadingIndicator />}
        </div>
    );
};

// Character Selection Component
const CharacterSelection: React.FC<{
    gameData: any;
    onSelectCharacter: (character: any) => void;
    selectedCharacter: any;
    onStartGame: () => void;
}> = ({ gameData, onSelectCharacter, selectedCharacter, onStartGame }) => {
    const characters = gameData.players.roles ||
        gameData.players.Roles ||
        gameData.players.character_roles || [];

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-800 text-white h-full">
            <h1 className="text-3xl font-bold mb-8">Choose Your Character</h1>

            <div className="grid grid-cols-2 gap-6 mb-8">
                {characters.map((character: any, index: number) => (
                    <div
                        key={index}
                        className={`w-64 h-80 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 flex flex-col items-center cursor-pointer transition-all ${
                            selectedCharacter?.name === character.name
                                ? 'border-3 border-blue-500 shadow-lg shadow-blue-500/20 transform -translate-y-1'
                                : 'hover:shadow-md hover:-translate-y-1'
                        }`}
                        onClick={() => onSelectCharacter({
                            name: character.name,
                            image: `url('./static/player-icons/${character.image || 'character.png'}')`
                        })}
                    >
                        <div
                            className="w-32 h-32 rounded-full border-4 border-white mb-4 bg-center bg-cover"
                            style={{
                                backgroundImage: `url('./static/player-icons/${character.image || 'character.png'}')`
                            }}
                        ></div>
                        <div className="text-xl font-bold mb-2 text-center">{character.name}</div>
                        <div className="text-sm text-gray-300 text-center">{character.ability}</div>
                    </div>
                ))}
            </div>

            <button
                className={`px-8 py-4 text-xl rounded-lg transition-colors ${
                    selectedCharacter
                        ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                        : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={!selectedCharacter}
                onClick={onStartGame}
            >
                Start Game
            </button>
        </div>
    );
};

// Helper Components
const RulesList: React.FC<{ rules: any }> = ({ rules }) => {
    if (!rules || typeof rules !== 'object') {
        return <p>{String(rules)}</p>;
    }

    if (Array.isArray(rules)) {
        return (
            <ul className="list-none pl-0">
                {rules.map((item, index) => (
                    <li key={index} className="mb-2">
                        {typeof item === 'object' ? <RulesList rules={item} /> : String(item)}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className="space-y-2">
            {Object.entries(rules).map(([key, value], index) => (
                <div key={index} className="mb-2">
                    <strong className="text-amber-800">{key}: </strong>
                    {typeof value === 'object' ? <RulesList rules={value} /> : String(value)}
                </div>
            ))}
        </div>
    );
};

const LoadingIndicator: React.FC = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-gray-800 font-semibold">
                Processing
                <span className="ml-1 inline-flex">
          <span className="animate-bounce mx-0.5">.</span>
          <span className="animate-bounce mx-0.5 animation-delay-200">.</span>
          <span className="animate-bounce mx-0.5 animation-delay-400">.</span>
        </span>
            </div>
        </div>
    </div>
);

const getLogEntryClass = (type: string) => {
    switch (type) {
        case 'my-player': return 'border-green-500 text-green-400';
        case 'system': return 'border-yellow-500 text-yellow-400';
        case 'event': return 'border-red-500 text-red-400';
        case 'result': return 'border-yellow-500 text-yellow-200';
        default: return 'border-green-500 text-green-400';
    }
};

export default BoardgameServerApp;