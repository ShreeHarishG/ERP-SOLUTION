// =============================================================================
// Onchain Insights — Outcome Analytics & Post-Mortem API Route
// GET: Aggregates historical recovery performance, trends, and risk clusters
// POST: Records a structured post-mortem review with 5-whys & action items
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getOutcomeAnalyticsData,
  addPostMortemRecord,
} from '@/lib/mock-data/onchain-insights/analytics';
import type {
  OutcomeAnalyticsFilterParams,
  PostMortemSubmissionPayload,
  DisruptionCategory,
  OutcomeFinalStatus,
} from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: OutcomeAnalyticsFilterParams = {
      dateRange: (searchParams.get('dateRange') as OutcomeAnalyticsFilterParams['dateRange']) || 'all',
      category: (searchParams.get('category') as DisruptionCategory | 'all') || 'all',
      finalStatus: (searchParams.get('finalStatus') as OutcomeFinalStatus | 'all') || 'all',
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as OutcomeAnalyticsFilterParams['sortBy']) || 'incidentDate',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const data = getOutcomeAnalyticsData(filters);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching outcome analytics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve outcome analytics data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PostMortemSubmissionPayload;

    if (!body.outcomeId) {
      return NextResponse.json(
        { error: 'outcomeId is required to record a post-mortem' },
        { status: 400 }
      );
    }

    if (!body.rootCauseSummary || !body.rootCauseCategory) {
      return NextResponse.json(
        { error: 'rootCauseCategory and rootCauseSummary are required' },
        { status: 400 }
      );
    }

    const record = addPostMortemRecord(body);

    return NextResponse.json({
      success: true,
      data: record,
      message: 'Post-mortem successfully recorded and linked to historical outcome',
    });
  } catch (error) {
    console.error('Error recording post-mortem:', error);
    return NextResponse.json(
      { error: 'Failed to record post-mortem review' },
      { status: 500 }
    );
  }
}
