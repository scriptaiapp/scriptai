import { createClient } from '@/lib/supabase/server';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }

    const { provider_token, refresh_token, user } = data.session;

    if (!provider_token) {
      return NextResponse.json({ error: 'No provider token received' }, { status: 400 });
    }

    // Fetch YouTube channel data
    const channelResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: {
          part: 'id,snippet,statistics,contentDetails,topicDetails,status,brandingSettings',
          mine: true,
        },
        headers: {
          Authorization: `Bearer ${provider_token}`,
        },
      }
    );

    const channelData = channelResponse.data.items[0];

    // Select highest-resolution thumbnail (high > medium > default)
    const thumbnail = channelData.snippet.thumbnails.high?.url ||
      channelData.snippet.thumbnails.medium?.url ||
      channelData.snippet.thumbnails.default?.url;

    // Prepare channel details for storage
    const channelDetails = {
      user_id: user.id,
      channel_id: channelData.id,
      provider_token,
      refresh_token,
      channel_name: channelData.snippet.title,
      channel_description: channelData.snippet.description,
      custom_url: channelData.snippet.customUrl,
      published_at: channelData.snippet.publishedAt,
      country: channelData.snippet.country,
      thumbnail,
      default_language: channelData.snippet.defaultLanguage,
      view_count: parseInt(channelData.statistics.viewCount, 10),
      subscriber_count: parseInt(channelData.statistics.subscriberCount, 10),
      video_count: parseInt(channelData.statistics.videoCount, 10),
      is_linked: channelData.status.isLinked,
      text_color: channelData.brandingSettings.watch?.textColor,
      background_color: channelData.brandingSettings.watch?.backgroundColor,
      topic_details: channelData.topicDetails || {},
      updated_at: new Date().toISOString(),
    };


    // Save channel details to youtube_channels table
    const { error: channelError } = await supabase
      .from('youtube_channels')
      .upsert(channelDetails, {
    onConflict: "user_id, channel_id",
  });

    if (channelError) {
      console.log(channelDetails)
      console.error('Error saving to youtube_channels:', channelError);
      return NextResponse.json({ error: 'Failed to save channel data' }, { status: 500 });
    }

    // Update profiles table to set youtube_connected to true
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ youtube_connected: true })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Error updating profiles:', profileError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error in YouTube callback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}