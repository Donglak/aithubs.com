#!/bin/bash
# Deploy Supabase Edge Functions
# Usage: ./scripts/deploy-edge-functions.sh

set -e

echo "🚀 Deploying Supabase Edge Functions..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in. Run: supabase login"
    exit 1
fi

# Get project ref from user or config
if [ -f ".supabase/config.toml" ]; then
    PROJECT_REF=$(grep 'project_id' .supabase/config.toml | cut -d'"' -f2)
else
    echo "Enter your Supabase Project Ref (from Dashboard URL):"
    read PROJECT_REF
fi

echo "📦 Project: $PROJECT_REF"

# Deploy functions
echo "📤 Deploying create-checkout-session..."
supabase functions deploy create-checkout-session --project-ref "$PROJECT_REF"

echo "📤 Deploying webhook..."
# PayPal/VNPay/MoMo không gửi JWT của Supabase -> tắt verify JWT, function tự xác thực chữ ký
supabase functions deploy webhook --project-ref "$PROJECT_REF" --no-verify-jwt

echo "📤 Deploying paypal-confirm..."
supabase functions deploy paypal-confirm --project-ref "$PROJECT_REF"

echo "📤 Deploying vendor-billing..."
supabase functions deploy vendor-billing --project-ref "$PROJECT_REF"

echo "📤 Deploying cancel-subscription..."
supabase functions deploy cancel-subscription --project-ref "$PROJECT_REF"

echo "📤 Deploying create-portal-session..."
supabase functions deploy create-portal-session --project-ref "$PROJECT_REF"

echo "📤 Deploying send-download-link..."
supabase functions deploy send-download-link --project-ref "$PROJECT_REF"

echo "📤 Deploying get-subscription..."
supabase functions deploy get-subscription --project-ref "$PROJECT_REF"

echo ""
echo "✅ All functions deployed!"
echo ""
echo "🔧 Next steps:"
echo "1. Set environment variables in Supabase Dashboard > Edge Functions"
echo "2. Configure PayPal Webhook URL: https://$PROJECT_REF.supabase.co/functions/v1/webhook?gateway=paypal"
echo "3. Run plan creation script: node scripts/create-paypal-plans.js"
echo "4. Test with: supabase functions serve (for local testing)"