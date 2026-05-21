FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace

COPY Warehouse_managment/pom.xml ./Warehouse_managment/pom.xml
RUN mvn -f ./Warehouse_managment/pom.xml dependency:go-offline

COPY Warehouse_managment/src ./Warehouse_managment/src
RUN mvn -f ./Warehouse_managment/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /workspace/Warehouse_managment/target/*.jar ./app.jar
COPY product-images ./product-images
COPY warehouse-app ./warehouse-app

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
