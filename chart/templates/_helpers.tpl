{{/*
Expand the name of the chart.
*/}}
{{- define "wpayz-gateway.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "wpayz-gateway.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "wpayz-gateway.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "wpayz-gateway.labels" -}}
helm.sh/chart: {{ include "wpayz-gateway.chart" . }}
{{ include "wpayz-gateway.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "wpayz-gateway.selectorLabels" -}}
app.kubernetes.io/name: {{ include "wpayz-gateway.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: wpayz-gateway
tier: backend
provider: wpayz
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "wpayz-gateway.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "wpayz-gateway.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
