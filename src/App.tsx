import React, { useState } from 'react';
import {FileText, Terminal, Dices, UtensilsCrossed, ChevronLeft, ChevronRight} from 'lucide-react';

import WrappedMockServerApp from './MockServer';
import BoardgameServerApp from './BoardgameServer';
import CVServerApp from "./CVServerApp";

const App: React.FC = () => {
    const [selectedProject, setSelectedProject] = useState<string>('mock-server');
    const [collapsed, setCollapsed] = useState(false);

    const projects = [
        { id: 'cv', name: 'Curriculum Vitae', icon: FileText },
        { id: 'mock-server', name: 'Mock Server', icon: Terminal },
        { id: 'boardgame', name: 'Boardgame', icon: Dices },
        { id: 'recipe', name: 'Recipe', icon: UtensilsCrossed }
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} relative`}>
                {/* Collapse toggle button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-5 bg-white rounded-full p-1 shadow-md z-10 border border-gray-200"
                >
                    {collapsed ?
                        <ChevronRight className="w-4 h-4 text-gray-600" /> :
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                    }
                </button>

                <div className="p-4">
                    <h2 className={`text-xl font-bold mb-4 ${collapsed ? 'text-center' : ''}`}>
                        {collapsed ? 'M' : 'Mini Projects'}
                    </h2>
                    <nav>
                        {projects.map(project => (
                            <button
                                key={project.id}
                                onClick={() => setSelectedProject(project.id)}
                                className={`flex items-center w-full p-2 rounded-lg mb-2 ${
                                    selectedProject === project.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                                }`}
                                title={collapsed ? project.name : ''}
                            >
                                <project.icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-2'}`} />
                                {!collapsed && project.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 p-0 overflow-auto">
                {selectedProject === 'cv' && <CVServerApp />}
                {selectedProject === 'mock-server' && <WrappedMockServerApp />}
                {selectedProject === 'boardgame' && <BoardgameServerApp />}
                {/* Recipe app would be added here when implemented */}
            </div>
        </div>
    );
};

export default App;