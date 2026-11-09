// =============================================================================
// ChainIQ Voice Recorder Utility
// Captures microphone input and encodes to genuine 16kHz mono WAV (RIFF PCM)
// Fully compatible with Gnani Prisma STT v3.0 REST endpoint without ffmpeg.
// =============================================================================

export class WavAudioRecorder {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private audioBuffers: Float32Array[] = [];
  private recordingLength = 0;
  private isRecording = false;

  async start(): Promise<void> {
    this.audioBuffers = [];
    this.recordingLength = 0;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    this.mediaStream = stream;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass({ sampleRate: 16000 });

    this.source = this.audioContext.createMediaStreamSource(stream);
    // Buffer size 4096, 1 input channel, 1 output channel
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const inputData = e.inputBuffer.getChannelData(0);
      this.audioBuffers.push(new Float32Array(inputData));
      this.recordingLength += inputData.length;
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    this.isRecording = true;
  }

  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      this.isRecording = false;

      // Disconnect audio nodes
      if (this.source && this.processor) {
        this.source.disconnect();
        this.processor.disconnect();
      }

      // Stop all microphone tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }

      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }

      // Merge buffers into a single Float32Array
      const mergedBuffer = new Float32Array(this.recordingLength);
      let offset = 0;
      for (const buffer of this.audioBuffers) {
        mergedBuffer.set(buffer, offset);
        offset += buffer.length;
      }

      // Encode as 16kHz 16-bit mono WAV Blob
      const wavBlob = encodeWAV(mergedBuffer, 16000);
      resolve(wavBlob);
    });
  }

  cancel(): void {
    this.isRecording = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

/**
 * Encodes raw 32-bit float audio samples into standard 16-bit PCM RIFF WAV format.
 */
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 1 * 2)
  view.setUint32(28, sampleRate * 2, true);
  // block align (1 * 2)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write 16-bit PCM samples
  let index = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    index += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

