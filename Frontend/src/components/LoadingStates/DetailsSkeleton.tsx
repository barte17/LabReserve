import React from 'react';

/**
 * Skeleton loading dla strony szczegółów sali
 * Odzwierciedla layout: grid z galerią (3 kolumny) i panelem bocznym (1 kolumna)
 */
export const SalaDetailsSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-neutral-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:items-stretch">

                    {/* Galeria zdjęć - 3 kolumny */}
                    <div className="lg:col-span-3">
                        <div className="card mb-6 h-full flex flex-col animate-pulse">
                            {/* Header */}
                            <div className="card-header flex items-center justify-between bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
                                <div className="h-7 bg-gray-300 rounded w-32"></div>
                                <div className="flex space-x-2">
                                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                </div>
                            </div>

                            {/* Główne zdjęcie */}
                            <div className="card-body flex-1">
                                <div className="w-full h-96 bg-gray-300 rounded-lg mb-4"></div>

                                {/* Miniaturki */}
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel boczny - 1 kolumna */}
                    <div className="h-full flex flex-col space-y-4">

                        {/* Podstawowe informacje */}
                        <div className="card animate-pulse">
                            <div className="card-header bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
                                <div className="h-6 bg-gray-300 rounded w-48"></div>
                            </div>
                            <div className="card-body space-y-5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Opiekun */}
                        <div className="card animate-pulse">
                            <div className="card-header bg-gradient-to-br from-primary-50 to-white border-b border-primary-200 py-2">
                                <div className="h-5 bg-gray-300 rounded w-32 py-1"></div>
                            </div>
                            <div className="card-body py-5">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                                        <div className="h-3 bg-gray-200 rounded w-40"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Przycisk akcji */}
                        <div className="card border-primary-200 bg-gradient-to-br from-primary-50 to-white animate-pulse">
                            <div className="card-body p-0">
                                <div className="h-16 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Opis - pełna szerokość */}
                <div className="card mt-4 bg-gradient-to-br from-neutral-50 to-white border-neutral-200 animate-pulse">
                    <div className="card-header bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
                        <div className="h-5 bg-gray-300 rounded w-24"></div>
                    </div>
                    <div className="card-body p-8 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                        <div className="h-4 bg-gray-200 rounded w-10/12"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Skeleton loading dla strony szczegółów stanowiska
 * Podobny layout jak SalaDetailsSkeleton
 */
export const StanowiskoDetailsSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-neutral-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:items-stretch">

                    {/* Galeria zdjęć - 3 kolumny */}
                    <div className="lg:col-span-3">
                        <div className="card mb-6 h-full flex flex-col animate-pulse">
                            {/* Header */}
                            <div className="card-header flex items-center justify-between bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
                                <div className="h-7 bg-gray-300 rounded w-40"></div>
                                <div className="flex space-x-2">
                                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                </div>
                            </div>

                            {/* Główne zdjęcie */}
                            <div className="card-body flex-1">
                                <div className="w-full h-96 bg-gray-300 rounded-lg mb-4"></div>

                                {/* Miniaturki */}
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel boczny - 1 kolumna */}
                    <div className="h-full flex flex-col space-y-4">

                        {/* Podstawowe informacje */}
                        <div className="card animate-pulse">
                            <div className="card-header bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
                                <div className="h-6 bg-gray-300 rounded w-48"></div>
                            </div>
                            <div className="card-body space-y-7">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lokalizacja */}
                        <div className="card animate-pulse">
                            <div className="card-header">
                                <div className="h-5 bg-gray-300 rounded w-24"></div>
                            </div>
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Przycisk akcji */}
                        <div className="card border-primary-200 bg-gradient-to-br from-primary-50 to-white animate-pulse">
                            <div className="card-body p-0">
                                <div className="h-16 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Opis - pełna szerokość */}
                <div className="card mt-4 bg-gradient-to-br from-neutral-50 to-white border-neutral-200 animate-pulse">
                    <div className="card-header bg-gradient-to-br from-primary-50 to-white border-b border-primary-200">
                        <div className="h-5 bg-gray-300 rounded w-32"></div>
                    </div>
                    <div className="card-body p-8 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                        <div className="h-4 bg-gray-200 rounded w-10/12"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
