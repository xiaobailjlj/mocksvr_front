import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from "@/components/ui/button";
import {config} from "./config";

interface MockRule {
  match_type: number;
  match_rule: string;
  response_code: string;
  response_header: Record<string, string>;
  response_body: string;
  delay_time: number;
  description: string;
  meta?: string;
}

interface MockData {
  url: string;
  response_code: string;
  response_header: Record<string, string>;
  response_body: string;
  owner: string;
  description: string;
  meta?: string;
  rules: MockRule[];
}

interface CreateMockDialogProps {
  onSuccess?: () => void;
}

const CreateMockDialog: React.FC<CreateMockDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new mock
  const [newMock, setNewMock] = useState<MockData>({
    url: '',
    response_code: '200',
    response_header: {
      'Content-Type': 'application/json'
    },
    response_body: '',
    owner: 'test_user',
    description: '',
    meta: '{}',
    rules: []
  });

  // Current rule being edited
  const [currentRule, setCurrentRule] = useState<MockRule>({
    match_type: 1,
    match_rule: '',
    response_code: '200',
    response_header: { 'Content-Type': 'application/json' },
    response_body: '',
    delay_time: 0,
    description: '',
    meta: '{}'
  });

  const resetForm = () => {
    setNewMock({
      url: '',
      response_code: '200',
      response_header: { 'Content-Type': 'application/json' },
      response_body: '',
      owner: 'test_user',
      description: '',
      meta: '{}',
      rules: []
    });
    setCurrentRule({
      match_type: 1,
      match_rule: '',
      response_code: '200',
      response_header: { 'Content-Type': 'application/json' },
      response_body: '',
      delay_time: 0,
      description: '',
      meta: '{}'
    });
    setError(null);
  };

  const handleCreateMock = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/v1/url/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMock)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create mock');
      }

      resetForm();
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleAddRule = () => {
    setNewMock(prev => ({
      ...prev,
      rules: [...prev.rules, currentRule]
    }));
    setCurrentRule({
      match_type: 1,
      match_rule: '',
      response_code: '200',
      response_header: { 'Content-Type': 'application/json' },
      response_body: '',
      delay_time: 0,
      description: '',
      meta: '{}'
    });
  };

  const handleRemoveRule = (index: number) => {
    setNewMock(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  return (
      <Dialog open={open} onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForm();
        }
        setOpen(newOpen);
      }}>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            New Mock
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Mock</DialogTitle>
            <DialogDescription>Configure a new mock endpoint</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateMock(); }}>
              {/* Basic Mock Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL Path</label>
                  <input
                      type="text"
                      value={newMock.url}
                      onChange={e => setNewMock({...newMock, url: e.target.value})}
                      className="w-full p-2 border rounded"
                      placeholder="/api/example"
                      required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Response Code</label>
                  <input
                      type="text"
                      value={newMock.response_code}
                      onChange={e => setNewMock({...newMock, response_code: e.target.value})}
                      className="w-full p-2 border rounded"
                      placeholder="200"
                      required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Response Headers (JSON)</label>
                <textarea
                    value={JSON.stringify(newMock.response_header, null, 2)}
                    onChange={e => {
                      try {
                        const headers = JSON.parse(e.target.value);
                        setNewMock({...newMock, response_header: headers});
                      } catch (err) {
                        // Invalid JSON - keep the text but don't update the state
                      }
                    }}
                    className="w-full p-2 border rounded h-24 font-mono"
                    placeholder="{}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Response Body</label>
                <textarea
                    value={newMock.response_body}
                    onChange={e => setNewMock({...newMock, response_body: e.target.value})}
                    className="w-full p-2 border rounded h-32 font-mono"
                    placeholder="{}"
                    required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                    type="text"
                    value={newMock.description}
                    onChange={e => setNewMock({...newMock, description: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Mock description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Meta Information (JSON)</label>
                <textarea
                    value={newMock.meta}
                    onChange={e => setNewMock({...newMock, meta: e.target.value})}
                    className="w-full p-2 border rounded h-24 font-mono"
                    placeholder="{}"
                />
              </div>

              {/* Rules Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Add Rule</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Match Type</label>
                      <select
                          value={currentRule.match_type}
                          onChange={e => setCurrentRule({...currentRule, match_type: Number(e.target.value)})}
                          className="w-full p-2 border rounded"
                      >
                        <option value={1}>Query Parameter</option>
                        <option value={2}>Request Body</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Match Rule</label>
                      <input
                          type="text"
                          value={currentRule.match_rule}
                          onChange={e => setCurrentRule({...currentRule, match_rule: e.target.value})}
                          className="w-full p-2 border rounded"
                          placeholder={currentRule.match_type === 1 ? "param=test" : '{"key":"value"}'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Response Code</label>
                      <input
                          type="text"
                          value={currentRule.response_code}
                          onChange={e => setCurrentRule({...currentRule, response_code: e.target.value})}
                          className="w-full p-2 border rounded"
                          placeholder="200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Delay Time (ms)</label>
                      <input
                          type="number"
                          value={currentRule.delay_time}
                          onChange={e => setCurrentRule({...currentRule, delay_time: Number(e.target.value)})}
                          className="w-full p-2 border rounded"
                          placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Rule Response Headers (JSON)</label>
                    <textarea
                        value={JSON.stringify(currentRule.response_header, null, 2)}
                        onChange={e => {
                          try {
                            const headers = JSON.parse(e.target.value);
                            setCurrentRule({...currentRule, response_header: headers});
                          } catch (err) {
                            // Invalid JSON
                          }
                        }}
                        className="w-full p-2 border rounded h-24 font-mono"
                        placeholder="{}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Rule Response Body</label>
                    <textarea
                        value={currentRule.response_body}
                        onChange={e => setCurrentRule({...currentRule, response_body: e.target.value})}
                        className="w-full p-2 border rounded h-24 font-mono"
                        placeholder="{}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Rule Description</label>
                    <input
                        type="text"
                        value={currentRule.description}
                        onChange={e => setCurrentRule({...currentRule, description: e.target.value})}
                        className="w-full p-2 border rounded"
                        placeholder="Rule description"
                    />
                  </div>

                  <Button
                      type="button"
                      onClick={handleAddRule}
                      variant="secondary"
                  >
                    Add Rule
                  </Button>
                </div>

                {/* Display current rules */}
                {newMock.rules.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Current Rules:</h4>
                      <div className="space-y-2">
                        {newMock.rules.map((rule, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded flex justify-between items-start">
                              <div>
                                <p>Match Type: {rule.match_type === 1 ? 'Query Parameter' : 'Request Body'}</p>
                                <p className="font-mono text-sm">{rule.match_rule}</p>
                                <p className="text-sm text-gray-500">{rule.description}</p>
                              </div>
                              <button
                                  type="button"
                                  onClick={() => handleRemoveRule(index)}
                                  className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                        ))}
                      </div>
                    </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600"
                >
                  Create Mock
                </Button>
              </div>
            </form>

            {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
};

export default CreateMockDialog;