// =============================================================================
// ChainIQ Voice Layer — Direct Text-to-Speech Synthesis Route
// Converts ERP insights, disruption alerts, or decisions into spoken WAV audio
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/server/env';

const FASTAPI_URL = env.FASTAPI_URL || process.env.FASTAPI_URL || 'http://localhost:8000';
const GNANI_API_KEY = env.GNANI_API_KEY || process.env.GNANI_API_KEY || 'vach_1ytE2CY5X2DkusTGSgqNcwVdcDo4HYfRasJNyMeJGeL1FVqZZaSeqxlzmepg04HgqGmlhcSMbvJVDNkrTvX70Z72tZ84sQvl_1cce87c2ad93f793971acd289a061708';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text || 'Notification from ChainIQ ERP.';
    const voice = body.voice || 'Shivani';
    const language = body.language || 'en-IN';

    // Try FastAPI proxy
    try {
      const res = await fetch(`${FASTAPI_URL}/api/voice/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, language }),
      });
      if (res.ok) {
        const audioBuffer = await res.arrayBuffer();
        return new NextResponse(audioBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Disposition': 'inline; filename="spoken_briefing.wav"',
          },
        });
      }
    } catch {
      // Fallback to direct cloud endpoint
    }

    const ttsRes = await fetch('https://api.vachana.ai/api/v1/tts/inference', {
      method: 'POST',
      headers: {
        'X-API-Key-ID': GNANI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
        model: 'timbre-v3.0',
        language,
        audio_config: {
          sample_rate: 24000,
          container: 'wav',
        },
      }),
    });

    if (!ttsRes.ok) {
      return NextResponse.json({ error: 'TTS synthesis error' }, { status: 502 });
    }

    const buffer = await ttsRes.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'inline; filename="spoken_briefing.wav"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'TTS request failed', details: err?.message }, { status: 500 });
  }
}

