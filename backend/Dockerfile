# 1. Étape de build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copie des scripts et dépendances Maven
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Téléchargement optimisé des dépendances
RUN ./mvnw dependency:go-offline -B

# Compilation et empaquetage
COPY src src
RUN ./mvnw clean package -DskipTests

# 2. Étape d'exécution (légère et non-root)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Création d'un utilisateur applicatif non-privilégié
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Récupération de l'artefact compilé
COPY --from=build --chown=spring:spring /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
