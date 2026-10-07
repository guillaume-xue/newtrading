# 1. Étape de build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copie des fichiers de configuration Maven
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Téléchargement des dépendances en cache
RUN ./mvnw dependency:go-offline -B

# Copie des sources et packaging
COPY src src
RUN ./mvnw clean package -DskipTests

# 2. Étape d'exécution (image légère)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Récupération du .jar compilé
COPY --from=build /app/target/*.jar app.jar

# Exposition du port applicatif
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
