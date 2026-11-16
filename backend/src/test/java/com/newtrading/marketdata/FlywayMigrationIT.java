package com.newtrading.marketdata;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class FlywayMigrationIT {

    @Autowired
    private Flyway flyway;

    @Test
    @DisplayName("Toutes les migrations Flyway (V1, V2, V3) doivent s'appliquer avec succès")
    void flywayMigrations_applySuccessfully() {
        MigrationInfo[] appliedMigrations = flyway.info().applied();

        assertThat(appliedMigrations)
                .extracting(MigrationInfo::getScript)
                .contains(
                        "V1__init_schema.sql",
                        "V2__add_indexes.sql",
                        "V3__create_market_candles.sql"
                );

        // Aucune migration ne doit être en état d'échec
        for (MigrationInfo info : appliedMigrations) {
            assertThat(info.getState().isFailed())
                    .as("La migration " + info.getScript() + " a échoué")
                    .isFalse();
        }
    }
}
