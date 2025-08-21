# Referral System Implementation Guide

This document outlines the complete referral system implementation for Script AI, including database setup, API endpoints, and frontend integration.

## 🏗️ System Architecture

The referral system consists of:
- **Database**: Enhanced referrals table with RLS policies
- **API Endpoints**: RESTful APIs for referral management
- **Frontend**: Dashboard integration and signup flow
- **Real-time Updates**: Supabase Realtime for live data

## 🗄️ Database Setup

### 1. Run the Migration

Execute the SQL migration in your Supabase SQL editor:

```sql
-- Run the contents of: lib/supabase/migrations/001_create_referrals_table.sql
```

### 2. Table Schema

The `referrals` table includes:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `referrer_id` | UUID | User who created the referral |
| `referred_email` | TEXT | Email of the referred user |
| `referred_id` | UUID | ID of the referred user (after signup) |
| `status` | TEXT | 'pending', 'completed', or 'expired' |
| `credits_awarded` | INTEGER | Credits given to referrer |
| `referral_code` | TEXT | Unique referral identifier |
| `expires_at` | TIMESTAMP | When the referral expires |
| `created_at` | TIMESTAMP | When referral was created |
| `completed_at` | TIMESTAMP | When referral was completed |
| `updated_at` | TIMESTAMP | Last update timestamp |

### 3. RLS Policies

- Users can only view their own referrals
- Users can only create referrals for themselves
- Users can only update their own referrals

## 🔌 API Endpoints

### 1. GET `/api/referrals`
Fetches user's referral data including statistics.

**Response:**
```json
{
  "referrals": [...],
  "totalCreditsEarned": 10,
  "pendingReferrals": 2,
  "totalReferrals": 5
}
```

### 2. POST `/api/create-referral`
Creates a new referral entry.

**Request:**
```json
{
  "email": "friend@example.com"
}
```

### 3. POST `/api/complete-referral`
Completes a referral when a user signs up.

**Request:**
```json
{
  "referralCode": "abc123",
  "referredUserId": "user-uuid"
}
```

### 4. POST `/api/track-referral`
Tracks referral completion during signup process.

**Request:**
```json
{
  "referralCode": "abc123",
  "userEmail": "friend@example.com"
}
```

## 🎯 Frontend Integration

### 1. Referrals Dashboard (`/dashboard/referrals`)

Features:
- Real-time referral statistics
- Copy/share referral links
- Referral history with pagination
- Status indicators (pending/completed/expired)
- Automatic refresh with Supabase Realtime

### 2. Enhanced Signup Flow

The signup page (`/signup?ref=code`) now:
- Captures referral codes from URL
- Shows referral banner for referred users
- Automatically tracks referrals upon successful signup
- Provides user feedback for referral tracking

## 🚀 Usage Flow

### For Referrers (Existing Users)

1. **Access Dashboard**: Navigate to `/dashboard/referrals`
2. **Copy Link**: Use the copy button to get referral link
3. **Share**: Share the link with friends via email, social media, etc.
4. **Track Progress**: Monitor pending and completed referrals
5. **Earn Credits**: Receive 5 credits for each successful referral

### For Referred Users

1. **Click Link**: Use the referral link shared by a friend
2. **Sign Up**: Complete the signup process
3. **Automatic Tracking**: Referral is automatically tracked
4. **Welcome**: Receive confirmation of successful referral

## 🔧 Configuration

### Environment Variables

Ensure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Credit System

- **Default Credits**: New users get 3 credits
- **Referral Bonus**: 5 credits per successful referral
- **Credit Usage**: Credits can be used for premium features

## 🧪 Testing

### Test Scenarios

1. **Create Referral**: Use the dashboard to create a referral
2. **Signup with Referral**: Test signup flow with referral code
3. **Credit Award**: Verify credits are awarded to referrer
4. **Status Updates**: Check referral status changes
5. **Expiration**: Test referral expiration logic

### Test Data

```sql
-- Insert test referral
INSERT INTO referrals (
  referrer_id,
  referred_email,
  status,
  referral_code,
  expires_at
) VALUES (
  'user-uuid',
  'test@example.com',
  'pending',
  'test123',
  NOW() + INTERVAL '30 days'
);
```

## 🚨 Error Handling

### Common Issues

1. **Invalid Referral Code**: Returns 404 with clear error message
2. **Expired Referral**: Returns 400 with expiration details
3. **Duplicate Referral**: Prevents multiple referrals to same email
4. **Unauthorized Access**: RLS policies ensure data security

### Error Responses

```json
{
  "error": "Referral not found or already completed",
  "status": 404
}
```

## 🔄 Real-time Updates

The system uses Supabase Realtime to:
- Update referral counts automatically
- Show real-time status changes
- Provide instant feedback for user actions

## 📱 Mobile Responsiveness

All components are designed to work on:
- Desktop (full dashboard view)
- Tablet (responsive grid layout)
- Mobile (collapsible sidebar, mobile-optimized forms)

## 🔒 Security Features

- **Row Level Security**: Users can only access their own data
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: API endpoints include basic rate limiting
- **Session Validation**: All requests require valid authentication

## 🚀 Performance Optimizations

- **Database Indexes**: Optimized queries with proper indexing
- **Pagination**: Large referral lists are paginated
- **Caching**: Supabase handles query caching automatically
- **Lazy Loading**: Components load data only when needed

## 📈 Monitoring & Analytics

### Key Metrics to Track

- Referral conversion rates
- Credit distribution patterns
- User engagement with referral features
- API endpoint performance

### Logging

All API endpoints include comprehensive logging:
- Request/response data
- Error details with stack traces
- Performance metrics
- User action tracking

## 🔮 Future Enhancements

Potential improvements:
- **Email Notifications**: Automated emails for referral events
- **Social Sharing**: Direct social media integration
- **Analytics Dashboard**: Detailed referral analytics
- **A/B Testing**: Referral link optimization
- **Multi-tier Referrals**: Referral chains and bonuses

## 🆘 Support

For issues or questions:
1. Check the database migration was applied correctly
2. Verify RLS policies are active
3. Check browser console for JavaScript errors
4. Review Supabase logs for API errors
5. Ensure all environment variables are set

## 📝 Changelog

### v1.0.0 (Current)
- Initial referral system implementation
- Basic dashboard with real-time updates
- Signup flow integration
- Credit system integration
- RLS security policies

---

This referral system provides a robust foundation for user acquisition and engagement while maintaining security and performance standards.
