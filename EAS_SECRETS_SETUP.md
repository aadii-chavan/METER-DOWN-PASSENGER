# EAS Secrets Setup Guide

## Overview
This guide explains how to set up EAS secrets to securely manage environment variables for your Expo app.

## Why EAS Secrets?
- **Security**: Secrets are encrypted and stored securely
- **No Hardcoding**: No sensitive data in version control
- **Environment Management**: Different secrets for different environments
- **Team Access**: Controlled access to secrets

## Setup Instructions

### 1. Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 2. Login to EAS
```bash
eas login
```

### 3. Configure Your Project
```bash
eas build:configure
```

### 4. Create Secrets for Your Project

#### Mapbox Access Token
```bash
eas secret:create --scope project --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value "pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV4YW1wbGUifQ.your_actual_token"
```

#### Supabase URL
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
```

#### Supabase Anon Key
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_key"
```

### 5. List Your Secrets
```bash
eas secret:list
```

### 6. Update Secrets (if needed)
```bash
eas secret:update --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value "new_token_value"
```

### 7. Delete Secrets (if needed)
```bash
eas secret:delete --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN
```

## Environment-Specific Secrets

### Development Environment
```bash
eas secret:create --scope project --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value "dev_token" --type development
```

### Preview Environment
```bash
eas secret:create --scope project --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value "preview_token" --type preview
```

### Production Environment
```bash
eas secret:create --scope project --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value "prod_token" --type production
```

## Local Development

For local development, create a `.env` file in your project root:

```bash
# .env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_local_token
EXPO_PUBLIC_SUPABASE_URL=your_local_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_local_supabase_key
```

**Important**: Never commit the `.env` file to version control!

## Security Best Practices

1. **Never hardcode secrets** in your code or configuration files
2. **Use different secrets** for different environments
3. **Rotate secrets regularly** for production
4. **Limit access** to secrets to only necessary team members
5. **Monitor secret usage** through EAS dashboard

## Troubleshooting

### Secret Not Found Error
If you get a "secret not found" error during build:
1. Check if the secret exists: `eas secret:list`
2. Verify the secret name matches exactly
3. Ensure you're logged in to the correct account

### Build Fails with Missing Environment Variables
1. Verify all required secrets are created
2. Check the secret names in `eas.json` match your secrets
3. Ensure secrets are created for the correct environment

## Additional Resources

- [EAS Secrets Documentation](https://docs.expo.dev/eas-update/environment-variables/)
- [EAS CLI Documentation](https://docs.expo.dev/eas-cli/)
- [Expo Security Best Practices](https://docs.expo.dev/guides/security/) 