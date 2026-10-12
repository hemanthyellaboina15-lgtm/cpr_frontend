package com.campus.reporting.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.InetSocketAddress;
import java.net.Socket;

@Configuration
@Profile("!test")
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/campus_problem_db}")
    private String pgUrl;

    @Value("${spring.datasource.username:postgres}")
    private String pgUsername;

    @Value("${spring.datasource.password:postgres}")
    private String pgPassword;

    @Value("${DB_HOST:localhost}")
    private String dbHost;

    @Value("${DB_PORT:5432}")
    private int dbPort;

    @Bean
    @Primary
    public DataSource dataSource() {
        if (isPostgreSqlAvailable(dbHost, dbPort)) {
            logger.info(">>> Successfully detected PostgreSQL at {}:{}. Connecting to PostgreSQL database! <<<", dbHost, dbPort);
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(pgUrl);
            config.setUsername(pgUsername);
            config.setPassword(pgPassword);
            config.setDriverClassName("org.postgresql.Driver");
            return new HikariDataSource(config);
        } else {
            logger.warn("================================================================================");
            logger.warn(">>> PostgreSQL on {}:{} is not currently running. <<<", dbHost, dbPort);
            logger.warn(">>> Auto-switching to persistent embedded database (./data/campusdb) so registration, <<<");
            logger.warn(">>> login, complaints, and all features work out-of-the-box immediately! <<<");
            logger.warn("================================================================================");
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl("jdbc:h2:file:./data/campusdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH");
            config.setUsername("sa");
            config.setPassword("");
            config.setDriverClassName("org.h2.Driver");
            return new HikariDataSource(config);
        }
    }

    private boolean isPostgreSqlAvailable(String host, int port) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 1000);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
