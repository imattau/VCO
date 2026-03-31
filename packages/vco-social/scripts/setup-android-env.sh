#!/bin/bash

# setup-android-env.sh
# Detects Android SDK/NDK and identifies shell to set up env variables.

echo "🔍 Detecting Android environment..."

# 1. Detect OS
OS_TYPE=$(uname -s)
echo "💻 OS Detected: $OS_TYPE"

# 2. Common SDK Paths
SDK_PATHS=(
    "$HOME/Android/Sdk"
    "$HOME/Library/Android/sdk"
    "/usr/lib/android-sdk"
    "/opt/android-sdk"
    "/mnt/c/Users/$USER/AppData/Local/Android/Sdk" # WSL
)

DETECTED_SDK=""
for path in "${SDK_PATHS[@]}"; do
    if [ -d "$path" ]; then
        DETECTED_SDK="$path"
        break
    fi
done

if [ -z "$DETECTED_SDK" ]; then
    echo "❌ Error: Android SDK not found in common locations."
    echo "Please specify your SDK path:"
    read -r DETECTED_SDK
fi

if [ ! -d "$DETECTED_SDK" ]; then
    echo "❌ Error: Path $DETECTED_SDK is not a directory."
    exit 1
fi

echo "✅ SDK Found: $DETECTED_SDK"

# 3. Detect NDK
DETECTED_NDK=""
if [ -d "$DETECTED_SDK/ndk" ]; then
    # Get the latest version (largest directory name)
    LATEST_NDK=$(ls -1 "$DETECTED_SDK/ndk" 2>/dev/null | sort -V | tail -n 1)
    if [ -n "$LATEST_NDK" ]; then
        DETECTED_NDK="$DETECTED_SDK/ndk/$LATEST_NDK"
    fi
elif [ -d "$DETECTED_SDK/ndk-bundle" ]; then
    DETECTED_NDK="$DETECTED_SDK/ndk-bundle"
fi

if [ -n "$DETECTED_NDK" ]; then
    echo "✅ NDK Found: $DETECTED_NDK"
else
    echo "⚠️  Warning: NDK not found in SDK folder."
fi

# 4. Detect Shell
CURRENT_SHELL=$(basename "$SHELL")
if [[ "$CURRENT_SHELL" == "setup-android-env.sh" ]]; then
    CURRENT_SHELL=$(ps -p $PPID -o comm= | sed 's/^-//')
fi

PROFILE_FILE=""
SHELL_TYPE="posix"

case "$CURRENT_SHELL" in
    zsh)
        PROFILE_FILE="$HOME/.zshrc"
        SHELL_TYPE="posix"
        ;;
    bash)
        if [[ "$OS_TYPE" == "Darwin" ]]; then
            PROFILE_FILE="$HOME/.bash_profile"
        else
            PROFILE_FILE="$HOME/.bashrc"
        fi
        SHELL_TYPE="posix"
        ;;
    fish)
        PROFILE_FILE="$HOME/.config/fish/config.fish"
        SHELL_TYPE="fish"
        mkdir -p "$(dirname "$PROFILE_FILE")"
        ;;
    *)
        PROFILE_FILE="$HOME/.profile"
        SHELL_TYPE="posix"
        ;;
esac

echo "🐚 Shell Detected: $CURRENT_SHELL"
echo "📝 Target Profile: $PROFILE_FILE"

# 5. Generate configuration
if [[ "$SHELL_TYPE" == "fish" ]]; then
    CONFIG_BLOCK="
# --- VCO Android Development Env ---
set -gx ANDROID_HOME \"$DETECTED_SDK\"
set -gx ANDROID_SDK_ROOT \"$DETECTED_SDK\""

    if [ -n "$DETECTED_NDK" ]; then
        CONFIG_BLOCK="$CONFIG_BLOCK
set -gx ANDROID_NDK_HOME \"$DETECTED_NDK\"
set -gx NDK_HOME \"$DETECTED_NDK\""
    fi

    CONFIG_BLOCK="$CONFIG_BLOCK
fish_add_path \$ANDROID_HOME/cmdline-tools/latest/bin
fish_add_path \$ANDROID_HOME/platform-tools
# -----------------------------------"
else
    CONFIG_BLOCK="
# --- VCO Android Development Env ---
export ANDROID_HOME=\"$DETECTED_SDK\"
export ANDROID_SDK_ROOT=\"$DETECTED_SDK\""

    if [ -n "$DETECTED_NDK" ]; then
        CONFIG_BLOCK="$CONFIG_BLOCK
export ANDROID_NDK_HOME=\"$DETECTED_NDK\"
export NDK_HOME=\"$DETECTED_NDK\""
    fi

    CONFIG_BLOCK="$CONFIG_BLOCK
export PATH=\"\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools\"
# -----------------------------------"
fi

echo -e "\n🚀 Suggested environment variables:"
echo "--------------------------------------------------"
echo -e "$CONFIG_BLOCK"
echo "--------------------------------------------------"

echo -e "\nWould you like to append this configuration to $PROFILE_FILE? (y/n)"

read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "$CONFIG_BLOCK" >> "$PROFILE_FILE"
    echo "✅ Configuration appended to $PROFILE_FILE."
    echo "👉 CRITICAL: Run 'source $PROFILE_FILE' in your terminal or restart it to apply changes."
else
    echo "ℹ️  No changes made. You can manually copy the block above."
fi
