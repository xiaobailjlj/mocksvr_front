import React, { useState } from 'react';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import {config} from "./config";

interface BiasResult {
    sentence: string;
    is_biased: boolean;
    bias_score: number;
}

interface AnalysisResult {
    article_id: string;
    total_sentences: number;
    biased_sentences: number;
    csv_path: string;
    sentences: BiasResult[];
}

interface SampleArticle {
    title: string;
    text: string;
}

const BiasDetectorApp: React.FC = () => {
    const [articleText, setArticleText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Sample articles for quick testing
    const sampleArticles: SampleArticle[] = [
        {
            title: "Neutral News Report",
            text: "The city council voted 5-2 to approve the new budget yesterday. The budget includes funding for road repairs and a new community center. Some residents expressed concerns about increased property taxes, while others supported the infrastructure improvements."
        },
        {
            title: "Biased Political Article",
            text: "The radical senator pushed through another terrible piece of legislation yesterday. These elitist politicians clearly don't care about hardworking Americans. The disastrous bill will surely lead to economic collapse. Only a few brave representatives stood up against this obvious power grab."
        },
        {
            title: "Mixed Bias Article",
            text: "The president announced a new policy yesterday that critics say will harm the economy. This controversial plan was designed to appeal to his core supporters. However, economic experts have mixed opinions, with some suggesting potential benefits in certain sectors. The administration claims it will create jobs, but many industry leaders disagree with this assessment."
        }
    ];

    const handleAnalyze = async () => {
        if (!articleText.trim()) {
            setError('Please enter some text to analyze');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await fetch(`${config.newsBiasUrl}/bias/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ article_text: articleText }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(`Error analyzing text: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const getBiasColor = (score: number) => {
        if (score < 0.3) return 'bg-green-100 border-l-4 border-green-500';
        if (score < 0.7) return 'bg-yellow-100 border-l-4 border-yellow-500';
        return 'bg-red-100 border-l-4 border-red-500';
    };

    const getTextColor = (score: number) => {
        if (score < 0.3) return 'text-green-800';
        if (score < 0.7) return 'text-yellow-800';
        return 'text-red-800';
    };

    const loadSampleArticle = (index: number) => {
        setArticleText(sampleArticles[index].text);
        setDropdownOpen(false);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">News Bias Detector</h1>
                <p className="text-gray-600">
                    Analyze news articles for potential bias at the sentence level using natural language processing.
                </p>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    News Article Text
                </label>
                <textarea
                    value={articleText}
                    onChange={(e) => setArticleText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-48"
                    placeholder="Paste a news article here to analyze it for bias..."
                />
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        'Analyze Article'
                    )}
                </button>

                <div className="relative inline-block">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                        Load Sample
                    </button>
                    {dropdownOpen && (
                        <div className="absolute z-10 bg-white shadow-lg rounded-md w-64 overflow-hidden mt-1">
                            {sampleArticles.map((article, index) => (
                                <button
                                    key={index}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200"
                                    onClick={() => loadSampleArticle(index)}
                                >
                                    {article.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {results && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4">Analysis Results</h2>

                    <div className="p-4 mb-6 bg-blue-50 rounded-md">
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <div className="text-sm text-gray-500">Total Sentences</div>
                                <div className="text-2xl font-bold">{results.total_sentences}</div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-500">Biased Sentences</div>
                                <div className="text-2xl font-bold">{results.biased_sentences}</div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-500">Bias Percentage</div>
                                <div className="text-2xl font-bold">
                                    {Math.round((results.biased_sentences / results.total_sentences) * 100)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">Sentence Analysis</h3>

                    <div className="space-y-3">
                        {results.sentences.map((result, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-md ${getBiasColor(result.bias_score)}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <p className="flex-grow">{result.sentence}</p>
                                    <div className={`text-sm font-semibold whitespace-nowrap ${getTextColor(result.bias_score)}`}>
                                        {Math.round(result.bias_score * 100)}% bias
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default BiasDetectorApp;