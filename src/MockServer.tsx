import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import CreateMockDialog from './CreateMockDialog';
import { useQueryURLDialog, QueryURLDialog, QueryURLDialogProvider } from './QueryURLDialog';
import { config } from './config';

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

interface MockResponse {
    success: boolean;
    message: string;
    urls: MockData[];
    total: number;
    current_page: number;
    page_size: number;
}

const MockServerApp: React.FC = () => {
    const [mockUrls, setMockUrls] = useState<MockData[]>([]);
    const [selectedMock, setSelectedMock] = useState<MockData | null>(null);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Fetch mock URLs with pagination
    const fetchMockUrls = async (page = 1) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/v1/url/query/all?page=${page}&size=${pageSize}`);
            if (!response.ok) throw new Error('Failed to fetch mock URLs');
            const data: MockResponse = await response.json();

            setMockUrls(data.urls);
            setTotalPages(Math.ceil(data.total / pageSize));
            setTotalItems(data.total);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    // Load initial data
    useEffect(() => {
        fetchMockUrls(currentPage);
    }, [currentPage, pageSize]);

    const handleTestMock = async () => {
        if (!selectedMock) return;

        try {
            const response = await fetch(`${config.mockServiceUrl}${selectedMock.url}`);
            const data = await response.json();
            setResponse(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const { setState } = useQueryURLDialog();

    const deleteMock = async (mock: MockData) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/v1/url/delete?url_id=${mock.id}`);
            const data = await response.json();
            setResponse(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    return (
        <div className="space-y-6">
            {/* Create New Mock Dialog */}
            <div className="flex justify-end mb-4">
                <CreateMockDialog onSuccess={() => fetchMockUrls(currentPage)} />
            </div>

            {/* Mock URLs List */}

            <Card>
                <CardHeader>
                    <CardTitle>Mock URLs</CardTitle>
                    <CardDescription>
                        Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems} URLs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <table className="w-full">
                            <thead>
                            <tr>
                                <th className="text-left p-2">ID</th>
                                <th className="text-left p-2">URL</th>
                                <th className="text-left p-2">Description</th>
                                <th className="text-left p-2">Details</th>
                                <th className="text-left p-2">Delete</th>
                                <th className="text-left p-2">Select</th>
                            </tr>
                            </thead>
                            <tbody>
                            {mockUrls.map(mock => (
                                <tr key={mock.url} className="border-t">
                                    <td className="p-2">{mock.id}</td>
                                    <td className="p-2">{mock.url}</td>
                                    <td className="p-2">{mock.description || '-'}</td>
                                    <td className="p-2">
                                        <button
                                            onClick={() => setState({ isOpen: true, mockData: mock })}
                                            className="text-blue-500 hover:text-blue-600"
                                        >
                                            Details
                                        </button>
                                    </td>
                                    <td className="p-2">
                                        <button
                                            onClick={async () => {
                                                await deleteMock(mock);
                                                fetchMockUrls(currentPage);
                                            }}
                                            className="text-blue-500 hover:text-blue-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                    <td className="p-2">
                                        <button
                                            onClick={() => setSelectedMock(mock)}
                                            className="text-blue-500 hover:text-blue-600"
                                        >
                                            Select
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border rounded p-1"
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="20">20 per page</option>
                                    <option value="50">50 per page</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Test Mock */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Play className="w-5 h-5 mr-2" />
                        Test Mock
                    </CardTitle>
                    <CardDescription>Test your mock endpoints</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded">
                            <p className="font-medium">Selected Mock:</p>
                            <p className="font-mono">{selectedMock?.url || 'None selected'}</p>
                        </div>
                        <button
                            onClick={handleTestMock}
                            disabled={!selectedMock}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                            Test Endpoint
                        </button>
                        {response && (
                            <div className="mt-4">
                                <h4 className="font-medium mb-2">Response:</h4>
                                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
};

const WrappedMockServerApp: React.FC = () => {
    return (
        <QueryURLDialogProvider>
            <MockServerApp />
            <QueryURLDialog />
        </QueryURLDialogProvider>
    );
};

export default WrappedMockServerApp;