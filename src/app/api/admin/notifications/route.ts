import { NextRequest, NextResponse } from 'next/server';
import { NotificationModel } from '@/models/notification.model';

export async function GET() {
  try {
    const [notifications, unreadCount] = await Promise.all([
      NotificationModel.findRecent(50),
      NotificationModel.countUnread(),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, all } = body;

    if (all) {
      await NotificationModel.markAllAsRead();
    } else if (id) {
      await NotificationModel.markAsRead(id);
    }

    const unreadCount = await NotificationModel.countUnread();

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await NotificationModel.clearAll();
    return NextResponse.json({
      success: true,
      message: 'All notifications cleared',
    });
  } catch (error) {
    console.error('Clear notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear notifications' },
      { status: 500 }
    );
  }
}
