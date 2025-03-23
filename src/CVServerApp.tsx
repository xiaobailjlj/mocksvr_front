import React from 'react';
import { Download } from 'lucide-react';

const CVServerApp: React.FC = () => {
    // Path to your CV PDF file
    const cvPath = '/CV_JingLu.pdf';

    return (
        <div className="flex flex-col h-full p-4">
            {/*/!* Download button in top right *!/*/}
            {/*<div className="flex justify-end mb-4">*/}
            {/*    <a*/}
            {/*        href={cvPath}*/}
            {/*        download*/}
            {/*        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"*/}
            {/*    >*/}
            {/*        <Download className="w-5 h-5" />*/}
            {/*        Download CV*/}
            {/*    </a>*/}
            {/*</div>*/}

            {/* PDF viewer taking up the rest of the space */}
            <div className="flex-1 w-full h-full">
                <object
                    data={cvPath}
                    type="application/pdf"
                    className="w-full h-full"
                >
                    <p className="text-center py-10">
                        Your browser doesn't support embedded PDFs.
                        <a
                            href={cvPath}
                            download
                            className="text-blue-600 hover:underline ml-1"
                        >
                            Download the PDF instead
                        </a>.
                    </p>
                </object>
            </div>
        </div>
    );
};

export default CVServerApp;