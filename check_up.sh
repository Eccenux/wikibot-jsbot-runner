: <<'COMMENT'
	Check for updates.
COMMENT

check_package_version() {
	local package=$1
    # Get version from package-lock.json
    version_from_lock=$(node -pe "require('./package-lock.json').packages['node_modules/$package'].version")
    # Get version from npm site
    version_from_npm=$(npm view "$package" version)

	if [ "$version_from_lock" = "$version_from_npm" ]; then
        echo "[INFO] Versions match for $package (no updates)."
    else
        echo "[WARNING] Versions differ for $package:"
		echo " lock.json: $version_from_lock"
		echo "  npm site: $version_from_npm"
    fi
}

# Check
check_package_version "puppeteer"
#check_package_version "mwn"
