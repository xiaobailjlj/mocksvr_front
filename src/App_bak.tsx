import React, { useState, useEffect } from 'react';
import { Terminal, Code, Plus, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';

interface MockRule {
  match_type: number;
  match_rule: string;
  response_code: string;
  response_header: Record<string, string>;
  response_body: string;
  delay_time: number;
  description: string;
  meta: string;
}

interface MockData {
  url: string;
  response_code: string;
  response_header: Record<string, string>;
  response_body: string;
  owner: string;
  description: string;
  meta: string;
  rules: MockRule[];
}

interface MockResponse {
  items: MockData[];
  total: number;
  page: number;
  page_size: number;
}

const MockServerApp: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>('mock-server');
  const [mockUrls, setMockUrls] = useState<MockData[]>([]);
  const [selectedMock, setSelectedMock] = useState<MockData | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Mock form state
  const [newMock, setNewMock] = useState<MockData>({
    url: '',
    response_code: '200',
    response_header: {},
    response_body: '',
    owner: '',
    description: '',
    meta: '',
    rules: []
  });

  const projects = [
    { id: 'mock-server', name: 'Mock Server', icon: Terminal },
    { id: 'other-project', name: 'Other Project', icon: Code }
  ];

  // Fetch mock URLs with pagination
  const fetchMockUrls = async (page = 1) => {
    try {
      const response = await fetch(`http://localhost:7001/v1/urls?page=${page}&page_size=${pageSize}`);
      if (!response.ok) throw new Error('Failed to fetch mock URLs');

      const data: MockResponse = await response.json();
      setMockUrls(data.items);
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

  const handleCreateMock = async () => {
    try {
      const response = await fetch('http://localhost:7001/v1/url/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMock)
      });

      if (!response.ok) throw new Error('Failed to create mock');

      await fetchMockUrls(currentPage);
      setNewMock({
        url: '',
        response_code: '200',
        response_header: {},
        response_body: '',
        owner: '',
        description: '',
        meta: '',
        rules: []
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTestMock = async () => {
    if (!selectedMock) return;

    try {
      const response = await fetch(`http://localhost:7002${selectedMock.url}`);
      const data = await response.json();
      setResponse(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Projects</h2>
            <nav>
              {projects.map(project => (
                  <button
                      key={project.id}
                      onClick={() => setSelectedProject(project.id)}
                      className={`flex items-center w-full p-2 rounded-lg mb-2 ${
                          selectedProject === project.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                      }`}
                  >
                    <project.icon className="w-5 h-5 mr-2" />
                    {project.name}
                  </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {selectedProject === 'mock-server' && (
              <div className="space-y-6">
                {/* Create New Mock */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Create New Mock
                    </CardTitle>
                    <CardDescription>Configure a new mock endpoint</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">URL Path</label>
                        <input
                            type="text"
                            value={newMock.url}
                            onChange={e => setNewMock({...newMock, url: e.target.value})}
                            className="w-full p-2 border rounded"
                            placeholder="/api/example"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Response Body</label>
                        <textarea
                            value={newMock.response_body}
                            onChange={e => setNewMock({...newMock, response_body: e.target.value})}
                            className="w-full p-2 border rounded h-32 font-mono"
                            placeholder="{}"
                        />
                      </div>
                      <button
                          type="button"
                          onClick={handleCreateMock}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Create Mock
                      </button>
                    </form>
                  </CardContent>
                </Card>

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
                          <th className="text-left p-2">URL</th>
                          <th className="text-left p-2">Description</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {mockUrls.map(mock => (
                            <tr key={mock.url} className="border-t">
                              <td className="p-2">{mock.url}</td>
                              <td className="p-2">{mock.description || '-'}</td>
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
          )}
        </div>
      </div>
  );
};

export default MockServerApp;