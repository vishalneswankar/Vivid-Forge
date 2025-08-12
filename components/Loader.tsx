import React from 'react';

const loadingMessages = [
    "Contacting the digital muse...",
    "Brewing pixels and possibilities...",
    "Reticulating splines...",
    "Warming up the AI's imagination...",
    "Generating a masterpiece...",
    "This might take a moment, great art needs patience...",
    "Translating your words into visuals...",
    "Painting with algorithms...",
    "Consulting with cosmic cartographers...",
    "Distilling dreams into data...",
    "Unleashing a torrent of creativity...",
    "The AI is in its flow state...",
];

export const Loader = () => {
    const [message, setMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
            <p className="text-gray-900 dark:text-white mt-4 text-lg font-semibold">{message}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Please wait while we create your wallpaper.</p>
        </div>
    );
};
