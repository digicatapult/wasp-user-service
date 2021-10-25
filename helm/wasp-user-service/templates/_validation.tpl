{{- if and .Values.config.init.adminPassword.enabled (empty .Values.config.init.adminPassword.password) }}
{{- fail "Init adminPassword must supply password if enabled" }}
{{- end }}
