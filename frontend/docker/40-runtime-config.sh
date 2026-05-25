#!/bin/sh
set -eu

config_path="/usr/share/nginx/html/assets/runtime-config.js"
api_base_url="${LAR_FRONTEND_API_BASE_URL:-http://localhost:5029}"
mock_api="${LAR_FRONTEND_MOCK_API:-false}"
environment_label="${LAR_FRONTEND_ENVIRONMENT_LABEL:-Docker API mode}"

case "$(printf '%s' "$mock_api" | tr '[:upper:]' '[:lower:]')" in
  1|true|yes|on) mock_api="true" ;;
  *) mock_api="false" ;;
esac

js_escape() {
  printf '%s' "$1" | sed "s/\\\\/\\\\\\\\/g; s/'/\\\\'/g"
}

cat > "$config_path" <<EOF
window.larRuntimeConfig = {
  apiBaseUrl: '$(js_escape "$api_base_url")',
  environmentLabel: '$(js_escape "$environment_label")',
  mockApi: $mock_api,
};
EOF

echo "Wrote runtime config to $config_path with apiBaseUrl=$api_base_url mockApi=$mock_api environmentLabel=$environment_label"
