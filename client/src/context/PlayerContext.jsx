import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  // Audio state
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('hub_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'

  // Video Player Modal State
  const [activeVideo, setActiveVideo] = useState(null);

  // Document Viewer Modal State
  const [activeDoc, setActiveDoc] = useState(null);

  // Image Lightbox State
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxList, setLightboxList] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Setup audio element properties
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNext();
      }
    };

    const handleError = (e) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [repeatMode, volume, isMuted]);

  // Sync volume changes
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;
    localStorage.setItem('hub_volume', volume.toString());
  }, [volume, isMuted]);

  // Periodic history recording for audio
  useEffect(() => {
    if (!currentTrack || !isPlaying || currentTime <= 2) return;

    const timer = setInterval(() => {
      if (currentTrack && isPlaying && currentTime > 0) {
        api.history.record(currentTrack.id, Math.floor(currentTime), currentTime >= duration - 2 ? 1 : 0).catch(() => {});
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [currentTrack, isPlaying, currentTime, duration]);

  const playTrack = useCallback((track, newQueue = null) => {
    if (!track) return;
    const audio = audioRef.current;

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      setQueue(newQueue);
      const foundIdx = newQueue.findIndex((t) => t.id === track.id);
      setQueueIndex(foundIdx !== -1 ? foundIdx : 0);
    } else if (queue.length === 0 || !queue.some((t) => t.id === track.id)) {
      setQueue([track]);
      setQueueIndex(0);
    }

    if (currentTrack?.id === track.id) {
      // Toggle
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      return;
    }

    setCurrentTrack(track);
    audio.src = track.filePath;
    audio.load();
    audio.play().then(() => {
      setIsPlaying(true);
      // Log initial history
      api.history.record(track.id, 0, 0).catch(() => {});
    }).catch((err) => {
      console.warn('Playback start error:', err);
    });
  }, [currentTrack, isPlaying, queue]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!currentTrack && queue.length > 0) {
      playTrack(queue[0]);
      return;
    }
    if (!currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;

    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = queueIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeatMode === 'all') {
          nextIdx = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }

    setQueueIndex(nextIdx);
    const nextItem = queue[nextIdx];
    if (nextItem) {
      playTrack(nextItem);
    }
  }, [queue, queueIndex, isShuffle, repeatMode, playTrack]);

  const handlePrev = () => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;
    const prevIdx = queueIndex - 1 < 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(prevIdx);
    const prevItem = queue[prevIdx];
    if (prevItem) {
      playTrack(prevItem);
    }
  };

  const seek = (time) => {
    const audio = audioRef.current;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const setVolumeLevel = (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const cycleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const addToQueue = (track) => {
    setQueue((prev) => [...prev, track]);
  };

  const removeFromQueue = (index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index === queueIndex) {
      handleNext();
    } else if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  };

  const clearQueue = () => {
    audioRef.current.pause();
    setIsPlaying(false);
    setCurrentTrack(null);
    setQueue([]);
    setQueueIndex(0);
    setCurrentTime(0);
    setDuration(0);
  };

  // Video Player Modal helpers
  const openVideo = (media) => {
    // Pause audio if playing
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setActiveVideo(media);
  };

  const closeVideo = () => {
    setActiveVideo(null);
  };

  // Document Modal helpers
  const openDocument = (media) => {
    setActiveDoc(media);
  };

  const closeDocument = () => {
    setActiveDoc(null);
  };

  // Lightbox helpers
  const openLightbox = (image, list = []) => {
    const imageList = list.length > 0 ? list : [image];
    setLightboxList(imageList);
    const idx = imageList.findIndex((item) => item.id === image.id);
    setLightboxIndex(idx !== -1 ? idx : 0);
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxList([]);
  };

  const nextLightbox = () => {
    if (lightboxList.length <= 1) return;
    const nextIdx = (lightboxIndex + 1) % lightboxList.length;
    setLightboxIndex(nextIdx);
    setLightboxImage(lightboxList[nextIdx]);
  };

  const prevLightbox = () => {
    if (lightboxList.length <= 1) return;
    const prevIdx = (lightboxIndex - 1 + lightboxList.length) % lightboxList.length;
    setLightboxIndex(prevIdx);
    setLightboxImage(lightboxList[prevIdx]);
  };

  return (
    <PlayerContext.Provider
      value={{
        // Audio
        currentTrack,
        isPlaying,
        queue,
        queueIndex,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        playTrack,
        togglePlay,
        nextTrack: handleNext,
        prevTrack: handlePrev,
        seek,
        setVolume: setVolumeLevel,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,

        // Video
        activeVideo,
        openVideo,
        closeVideo,

        // Document
        activeDoc,
        openDocument,
        closeDocument,

        // Lightbox
        lightboxImage,
        openLightbox,
        closeLightbox,
        nextLightbox,
        prevLightbox
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
