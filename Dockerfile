# Etapa 1: compilar con Maven
FROM maven:3.9.11-eclipse-temurin-25 AS build
WORKDIR /workspace
COPY pom.xml ./
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# Etapa 2: imagen liviana solo para ejecutar
FROM eclipse-temurin:25-jre
WORKDIR /app
RUN useradd --system --uid 1001 spring && mkdir -p /app/logs && chown spring /app/logs
COPY --from=build /workspace/target/gestor-productos-0.0.1-SNAPSHOT.jar app.jar
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
