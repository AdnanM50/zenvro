import { NextResponse } from 'next/server';
import { AnalyticsSettingsModel } from '@/models/analytics-settings.model';

export async function GET() {
  try {
    const settings = await AnalyticsSettingsModel.get();
    return NextResponse.json({
      success: true,
      data: {
        hotjarId: settings.hotjarId || '',
        googleAnalyticsId: settings.googleAnalyticsId || '',
        googleTagManagerId: settings.googleTagManagerId || '',
        facebookPixelId: settings.facebookPixelId || '',
        microsoftClarityId: settings.microsoftClarityId || '',
        tiktokPixelId: settings.tiktokPixelId || '',
        snapchatPixelId: settings.snapchatPixelId || '',
        linkedInInsightId: settings.linkedInInsightId || '',
        customScriptsHead: settings.customScriptsHead || '',
        customScriptsBody: settings.customScriptsBody || '',
        customScriptsFooter: settings.customScriptsFooter || '',
      },
    });
  } catch {
    return NextResponse.json({ success: false, data: null }, { status: 500 });
  }
}
