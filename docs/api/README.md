# 📖 Documentation API - NewTrading

Ce dossier centralise les spécifications techniques des interfaces de NewTrading.

## 🛠️ Visualisation Locale de la Spécification
Vous pouvez prévisualiser la spécification OpenAPI avec l'extension VSCode *Swagger Viewer* ou via Docker :
```bash
docker run -p 8081:8080 -e SWAGGER_JSON=/spec/openapi.yaml -v $(pwd):/spec swaggerapi/swagger-ui
