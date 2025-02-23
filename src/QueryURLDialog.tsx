import React, { useState, createContext, useContext } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from './components/ui/dialog';

interface MockRule {
    match_type: number;
    match_rule: string;
    response_code: string;
    response_header: string;
    response_body?: string;
    delay_time?: number;
    description?: string;
}

interface MockData {
    id: number;
    url: string;
    response_code: string;
    response_header: string;
    response_body: string;
    owner: string;
    description: string;
    rules: MockRule[];
}

type DialogState = {
    isOpen: boolean;
    mockData: MockData | null;
};

const DialogContext = createContext<{
    state: DialogState;
    setState: React.Dispatch<React.SetStateAction<DialogState>>;
} | null>(null);

const useQueryURLDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useQueryURLDialog must be used within a QueryURLDialogProvider');
    }
    return context;
};

const QueryURLDialog: React.FC & { open: (mock: MockData) => void } = () => {
    const context = useContext(DialogContext);
    if (!context) return null;

    const { state, setState } = context;

    const handleClose = () => {
        setState({ isOpen: false, mockData: null });
    };

    return (
        <Dialog open={state.isOpen} onOpenChange={() => handleClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>URL Details</DialogTitle>
                </DialogHeader>

                {state.mockData && (
                    <div className="overflow-y-auto max-h-[60vh] space-y-4 p-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">URL Path</p>
                                    <p className="font-mono">{state.mockData.url}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Response Code</p>
                                    <p className="font-mono">{state.mockData.response_code}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Response Headers</h3>
                            <pre className="bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(state.mockData.response_header, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Response Body</h3>
                            <pre className="bg-gray-50 p-2 rounded overflow-x-auto">
                                {state.mockData.response_body}
                            </pre>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Rules</h3>
                            <div className="space-y-4">
                                {state.mockData.rules?.map((rule, index) => (
                                    <div key={index} className="border rounded p-4 bg-gray-50">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium">Match Type</p>
                                                <p>{rule.match_type === 1 ? 'Query Parameter' : 'Request Body'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium overflow-x-auto">Match Rule</p>
                                                <p className="font-mono">{rule.match_rule}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm font-medium overflow-x-auto">Description</p>
                                            <p>{rule.description}</p>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm font-medium ">Response Code</p>
                                            <p className="text-sm font-medium">{rule.response_code}</p>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm font-medium ">Response Header</p>
                                            <pre className="bg-gray-100 p-2 rounded mt-1 text-sm overflow-x-auto">
                                                {JSON.stringify(rule.response_header, null, 2)}
                                            </pre>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm font-medium ">Response Body</p>
                                            <pre className="bg-gray-100 p-2 rounded mt-1 text-sm overflow-x-auto">
                                                {JSON.stringify(rule.response_body, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

// Provider component to manage dialog state
const QueryURLDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<DialogState>({
        isOpen: false,
        mockData: null
    });

    return (
        <DialogContext.Provider value={{ state, setState }}>
            {children}
            <QueryURLDialog />
        </DialogContext.Provider>
    );
};

// Static method to open the dialog
QueryURLDialog.open = (mockData: MockData) => {
    const context = document.querySelector('[data-dialog-context]');
    if (context) {
        const contextValue = (context as any)._context;
        if (contextValue) {
            contextValue.setState({ isOpen: true, mockData });
        }
    }
};

export { useQueryURLDialog, QueryURLDialog, QueryURLDialogProvider };