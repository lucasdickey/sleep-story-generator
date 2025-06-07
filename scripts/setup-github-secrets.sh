#!/bin/bash

# Script to set GitHub Actions secrets from .env.local
# Make sure you have gh CLI installed and authenticated

if [ ! -f ".env.local" ]; then
    echo "Error: .env.local file not found!"
    exit 1
fi

echo "Setting GitHub Actions secrets from .env.local..."

# Read .env.local and set secrets for keys that are needed in GitHub Actions
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ $key =~ ^#.*$ ]] || [[ -z $key ]]; then
        continue
    fi
    
    # Remove any quotes from the value
    value=$(echo "$value" | sed 's/^"//;s/"$//')
    
    # Set secrets for keys that GitHub Actions needs
    case $key in
        OPENAI_API_KEY|OPENAI_MODEL|ELEVENLABS_API_KEY|ELEVENLABS_VOICE_ID|SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AWS_REGION|AWS_S3_BUCKET_NAME)
            echo "Setting secret: $key"
            echo "$value" | gh secret set "$key"
            ;;
    esac
done < .env.local

echo "Done! GitHub Actions secrets have been set." 