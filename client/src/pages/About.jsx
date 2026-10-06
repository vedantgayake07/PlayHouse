import React from 'react';
import {
  Server,
  Layers,
  Cpu,
  Network,
  Radio,
  HardDrive,
  ShieldCheck,
  Zap,
  FileCode,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const About = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
          <Network size={14} />
          <span>System Architecture & Engineering</span>
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
          About Distributed Multimedia Systems
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.6' }}>
          An architectural overview of how modern distributed multimedia platforms ingest, store, stream, and synchronize high-bandwidth continuous media across network boundaries.
        </p>
      </div>

      {/* Section 1: Core Challenges & Architecture */}
      <div className="clean-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server size={18} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
            1. Distributed Media Distribution Architecture
          </h2>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-body)', lineHeight: '1.7' }}>
          Continuous media (audio and video) fundamentally differs from traditional static text or transactional data. A distributed multimedia system must satisfy strict temporal constraints — audio frames and video frames must arrive and decode at deterministic intervals to prevent buffer underruns, packet jitter, and audio-video desynchronization.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '4px' }}>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 600, fontSize: '13.5px', marginBottom: '4px', color: 'var(--text-main)' }}>
              Byte-Range Progressive HTTP
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Compliant with RFC 7233, servers utilize <code style={{ fontSize: '11.5px', color: 'var(--accent)' }}>Accept-Ranges: bytes</code> headers. Clients request arbitrary slices of media files on demand, enabling instant seeking without loading the full file.
            </p>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 600, fontSize: '13.5px', marginBottom: '4px', color: 'var(--text-main)' }}>
              Edge Caching & CDNs
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Media is replicated and cached at regional points of presence (PoPs) close to users, drastically minimizing latency, round-trip time (RTT), and origin server egress load.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Codecs and Compression */}
      <div className="clean-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--badge-audio-bg)', color: 'var(--badge-audio)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCode size={18} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
            2. Compression Standards & Container Formats
          </h2>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-body)', lineHeight: '1.7' }}>
          Raw 4K video at 60 fps requires over 12 Gigabits per second of uncompressed bandwidth. Compression codecs remove spatial redundancy (intra-frame DCT / transform coding) and temporal redundancy (inter-frame motion estimation between I-frames, P-frames, and B-frames).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px 14px', borderLeft: '3px solid var(--accent)', backgroundColor: 'var(--bg-subtle)' }}>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>H.264 / AVC & AV1</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Industry standards offering high compression efficiency and hardware-accelerated decoding.</div>
          </div>

          <div style={{ padding: '12px 14px', borderLeft: '3px solid var(--badge-audio)', backgroundColor: 'var(--bg-subtle)' }}>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>AAC & Lossless PCM</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Psychoacoustic compression (AAC) or uncompressed pulse-code modulation (WAV) preserving full dynamic range.</div>
          </div>

          <div style={{ padding: '12px 14px', borderLeft: '3px solid var(--badge-image)', backgroundColor: 'var(--bg-subtle)' }}>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>Vector SVG & WebP</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Infinite resolution geometric definitions (SVG) and modern lossy/lossless compressed raster graphics (WebP).</div>
          </div>
        </div>
      </div>

      {/* Section 3: Quality of Service (QoS) */}
      <div className="clean-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--badge-image-bg)', color: 'var(--badge-image)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={18} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
            3. Quality of Service (QoS) & Buffer Management
          </h2>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-body)', lineHeight: '1.7' }}>
          QoS parameters quantify network performance. When network congestion causes packet jitter, client-side playout buffers absorb the arrival variance. Key metrics monitored include:
        </p>

        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'var(--text-body)' }}>
          <li><strong>Throughput / Bitrate</strong>: Minimum sustainable bandwidth required for real-time decoding.</li>
          <li><strong>Delay & Round-Trip Latency</strong>: Time elapsed from request transmission to first frame playout.</li>
          <li><strong>Playout Jitter</strong>: Statistical deviation in packet arrival intervals; countered by dynamic playout buffering.</li>
          <li><strong>Packet Loss Concealment (PLC)</strong>: Mathematical interpolation to mask dropped audio/video segments.</li>
        </ul>
      </div>

      {/* Section 4: Architecture in Multimedia Hub */}
      <div className="clean-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive size={18} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
            4. Implementation within Multimedia Hub
          </h2>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-body)', lineHeight: '1.7' }}>
          Multimedia Hub incorporates these distributed systems principles across its engineering stack:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: 'var(--text-body)' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Static Range-Aware Media Pipeline</strong>: Express server serves media with range header support, enabling responsive seeking in HTML5 audio and video players.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: 'var(--text-body)' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Structured Relational Modeling</strong>: SQLite schema indexes media items by type, category, and date while tracking persistent playback progress and favorites with foreign-key cascade integrity.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: 'var(--text-body)' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Persistent Client Playback Engine</strong>: Global Player context orchestrates uninterrupted audio queues while the user navigates between pages.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
