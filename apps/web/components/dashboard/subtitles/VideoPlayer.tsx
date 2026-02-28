"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    Loader2,
    Play,
    Pause,
    Info,
    Film,
    Maximize,
    Minimize,
    Volume2,
    VolumeX,
    Settings,
    Check
} from 'lucide-react';
import {formatTime} from "@/utils/toolsUtil";




type VideoPlayerProps = {
    videoUrl: string;
    title: string;
    subtitleUrl: string | null;
    onDownloadVideo: () => Promise<void>;
    isDownloadDisabled: boolean;
    downloadVideoLoading: boolean;
    detectedLanguage?: string;
    targetLanguage?: string;
    language?: string;
};

export const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(
    ({ videoUrl, title, subtitleUrl, onDownloadVideo, isDownloadDisabled, downloadVideoLoading, detectedLanguage, targetLanguage, language }, ref) => {


        const [isPlaying, setIsPlaying] = useState(false);
        const [progress, setProgress] = useState(0);
        const [currentTime, setCurrentTime] = useState(0);
        const [duration, setDuration] = useState(0);
        const [volume, setVolume] = useState(1);
        const [isMuted, setIsMuted] = useState(false);
        const [isFullscreen, setIsFullscreen] = useState(false);
        const [showControls, setShowControls] = useState(true);


        const [showSettings, setShowSettings] = useState(false);
        const [playbackRate, setPlaybackRate] = useState(1);
        const [isSubtitleOn, setIsSubtitleOn] = useState(true);


        const internalVideoRef = useRef<HTMLVideoElement>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);


        const setRefs = (element: HTMLVideoElement | null) => {
            internalVideoRef.current = element;
            if (typeof ref === "function") ref(element);
            else if (ref) ref.current = element;
        };


        const togglePlay = () => {
            if (internalVideoRef.current) {
                if (isPlaying) {
                    internalVideoRef.current.pause();
                } else {
                    internalVideoRef.current.play();
                }
                setIsPlaying(!isPlaying);
            }
        };

        const toggleMute = () => {
            if (internalVideoRef.current) {
                internalVideoRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
            }
        };

        const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newVol = parseFloat(e.target.value);
            setVolume(newVol);
            if (internalVideoRef.current) {
                internalVideoRef.current.volume = newVol;
                internalVideoRef.current.muted = newVol === 0;
                setIsMuted(newVol === 0);
            }
        };

        const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
            const seekTime = (parseFloat(e.target.value) / 100) * duration;
            if (internalVideoRef.current) {
                internalVideoRef.current.currentTime = seekTime;
                setProgress(parseFloat(e.target.value));
            }
        };

        const toggleFullscreen = () => {
            if (!document.fullscreenElement) {
                containerRef.current?.requestFullscreen();
                setIsFullscreen(true);
            } else {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        };

        const handlePlaybackRate = (rate: number) => {
            if (internalVideoRef.current) {
                internalVideoRef.current.playbackRate = rate;
                setPlaybackRate(rate);
            }
        };

        const toggleSubtitles = (enabled: boolean) => {
            if (internalVideoRef.current && internalVideoRef.current.textTracks.length > 0) {
                const track = internalVideoRef.current.textTracks[0];
                track!.mode = enabled ? 'showing' : 'hidden';
                setIsSubtitleOn(enabled);
            }
        };


        const onTimeUpdate = () => {
            if (internalVideoRef.current) {
                const current = internalVideoRef.current.currentTime;
                const total = internalVideoRef.current.duration;
                setCurrentTime(current);
                setProgress((current / total) * 100);
            }
        };

        const onLoadedMetadata = () => {
            if (internalVideoRef.current) {
                setDuration(internalVideoRef.current.duration);
                if (internalVideoRef.current.textTracks[0]) {
                    internalVideoRef.current.textTracks[0].mode = isSubtitleOn ? 'showing' : 'hidden';
                }
            }
        };

        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            if (isPlaying) {
                controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
            }
        };

        useEffect(() => {
            const closeSettings = (e: MouseEvent) => {
                // @ts-ignore
                if (showSettings && !e.target?.closest('.settings-container')) {
                    setShowSettings(false);
                }
            };
            document.addEventListener('mousedown', closeSettings);
            return () => document.removeEventListener('mousedown', closeSettings);
        }, [showSettings]);

        return (
            <section className="flex flex-col gap-4 w-full h-full">


                <div
                    ref={containerRef}
                    className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 dark:border-slate-800 group select-none flex-shrink-0"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => isPlaying && setShowControls(false)}
                >

                    <video
                        ref={setRefs}
                        key={videoUrl}
                        src={videoUrl}
                        className="w-full h-full object-contain bg-black"
                        onClick={togglePlay}
                        onTimeUpdate={onTimeUpdate}
                        onLoadedMetadata={onLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                        crossOrigin="anonymous"
                    >
                        {subtitleUrl && (
                            <track
                                key={subtitleUrl}
                                src={subtitleUrl}
                                kind="subtitles"
                                label="English"
                                default={isSubtitleOn}
                            />
                        )}
                    </video>


                    {(!isPlaying || showControls) && (
                        <div
                            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${!isPlaying ? 'opacity-100' : 'opacity-0'}`}
                            onClick={togglePlay}
                        >
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center hover:scale-105 hover:bg-white/30 transition-all duration-300 cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.4)]">
                                {isPlaying ? (
                                    <Pause className="w-8 h-8 text-white fill-current" />
                                ) : (
                                    <Play className="w-8 h-8 ml-1 text-white fill-current" />
                                )}
                            </div>
                        </div>
                    )}


                    <div className={`absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>


                        <div className="relative group/timeline w-full h-1.5 mb-4 cursor-pointer flex items-center">
                            <div className="absolute w-full h-full bg-white/30 rounded-full overflow-hidden" />
                            <div
                                className="absolute h-full bg-brand-primary rounded-full pointer-events-none z-10"
                                style={{ width: `${progress}%` }}
                            />
                            <div
                                className="absolute h-3.5 w-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] scale-0 group-hover/timeline:scale-100 transition-transform z-20"
                                style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                            />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.1"
                                value={progress}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                            />
                        </div>


                        <div className="flex justify-between items-center text-white">


                            <div className="flex items-center gap-5">
                                <button onClick={togglePlay} className="hover:text-brand-primary transition-colors">
                                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                                </button>

                                <div className="flex items-center gap-2 group/volume">
                                    <button onClick={toggleMute} className="hover:text-brand-primary transition-colors">
                                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-brand-primary"
                                    />
                                </div>

                                <span className="text-xs font-bold tracking-wider opacity-90 select-none">
                                    {formatTime(currentTime)} <span className="opacity-50 mx-1">/</span> {formatTime(duration)}
                                </span>
                            </div>


                            <div className="flex items-center gap-4 relative settings-container">


                                {showSettings && (
                                    <div className="absolute bottom-12 right-0 bg-[#0f172a]/95 border border-white/10 backdrop-blur-xl rounded-2xl p-4 w-60 shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-50">


                                        <div className="mb-4 border-b border-slate-700/50 pb-3">
                                            <p className="text-[10px] font-bold text-slate-400 px-2 py-1 mb-1.5 uppercase tracking-widest flex items-center gap-2">
                                                <span className="material-icons-round text-sm">subtitles</span> Subtitles
                                            </p>
                                            <div className="space-y-1">
                                                <button
                                                    onClick={() => toggleSubtitles(false)}
                                                    className={`w-full text-sm font-medium text-left px-3 py-2 rounded-xl transition-colors flex justify-between items-center ${!isSubtitleOn ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                                                >
                                                    Off
                                                    {!isSubtitleOn && <Check className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => toggleSubtitles(true)}
                                                    className={`w-full text-sm font-medium text-left px-3 py-2 rounded-xl transition-colors flex justify-between items-center ${isSubtitleOn ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                                                >
                                                    English
                                                    {isSubtitleOn && <Check className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>


                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 px-2 py-1 mb-1.5 uppercase tracking-widest flex items-center gap-2">
                                                <span className="material-icons-round text-sm">speed</span> Playback Speed
                                            </p>
                                            <div className="grid grid-cols-4 gap-1">
                                                {[0.5, 1, 1.5, 2].map((rate) => (
                                                    <button
                                                        key={rate}
                                                        onClick={() => handlePlaybackRate(rate)}
                                                        className={`text-xs font-bold py-2 rounded-lg transition-all ${playbackRate === rate ? 'bg-brand-primary text-white shadow-md' : 'bg-transparent text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                                    >
                                                        {rate}x
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className={`transition-all ${showSettings ? 'text-brand-primary rotate-90' : 'text-white hover:text-brand-primary'} duration-300`}
                                >
                                    <Settings className="w-5 h-5" />
                                </button>

                                <button onClick={toggleFullscreen} className="hover:text-brand-primary transition-colors text-white">
                                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


                <Card className="rounded-[1.5rem] border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] bg-white dark:bg-[#0E1338] shrink-0">
                    <CardContent className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">


                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <Info className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white max-w-[200px] sm:max-w-[300px] truncate" title={title}>
                                    {title || "Video Details"}
                                </h3>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className="text-[11px] font-bold font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        {Math.round(duration) || "0:00"} SEC
                                    </span>

                                    {language === "en" && detectedLanguage && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                            <div className="flex items-center gap-1.5 text-xs font-bold">
                                                <span className="text-slate-500 capitalize" title={`User selected: ${language}`}>
                                                    {detectedLanguage} <span className="opacity-50 font-medium">(AI)</span>
                                                </span>
                                                <span className="text-slate-300 dark:text-slate-600">&rarr;</span>
                                                <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary border-none shadow-none text-[10px] px-2 py-0">
                                                    {targetLanguage || "English"}
                                                </Badge>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold h-10 px-5 rounded-xl shadow-sm transition-all"
                            onClick={onDownloadVideo}
                            disabled={isDownloadDisabled || downloadVideoLoading}
                        >
                            {downloadVideoLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                            ) : (
                                <><Download className="mr-2 h-4 w-4" /> Download Video</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </section>
        );
    }
);

VideoPlayer.displayName = "VideoPlayer";