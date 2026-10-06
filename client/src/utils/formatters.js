export function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedSecs = secs < 10 ? `0${secs}` : secs;

  if (hours > 0) {
    const paddedMins = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${paddedMins}:${paddedSecs}`;
  }

  return `${minutes}:${paddedSecs}`;
}

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

export function getMediaTypeDetails(type) {
  switch (type) {
    case 'video':
      return { label: 'Video', color: 'var(--badge-video)', bg: 'var(--badge-video-bg)' };
    case 'audio':
      return { label: 'Audio', color: 'var(--badge-audio)', bg: 'var(--badge-audio-bg)' };
    case 'image':
      return { label: 'Image', color: 'var(--badge-image)', bg: 'var(--badge-image-bg)' };
    case 'document':
      return { label: 'Document', color: 'var(--badge-doc)', bg: 'var(--badge-doc-bg)' };
    default:
      return { label: 'Media', color: 'var(--text-body)', bg: 'var(--bg-subtle)' };
  }
}
