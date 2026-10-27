package com.newtrading.marketdata.repository;

import com.newtrading.marketdata.model.MarketCandle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("test")
class MarketCandleRepositoryTest {

    @Autowired
    private MarketCandleRepository candleRepository;

    private Instant now;

    @BeforeEach
    void setUp() {
        candleRepository.deleteAll();
        now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
    }

    @Test
    @DisplayName("Doit persister et retrouver les bougies triées par ordre chronologique ascendant")
    void saveAndFind_orderedByOpenTimeAsc_success() {
        MarketCandle candleDay1 = MarketCandle.builder()
                .assetCode("AAPL")
                .timeframe("1D")
                .openTime(now.minus(2, ChronoUnit.DAYS))
                .openPrice(new BigDecimal("180.00000000"))
                .highPrice(new BigDecimal("185.00000000"))
                .lowPrice(new BigDecimal("179.50000000"))
                .closePrice(new BigDecimal("184.20000000"))
                .volume(new BigDecimal("1500000.00000000"))
                .build();

        MarketCandle candleDay2 = MarketCandle.builder()
                .assetCode("AAPL")
                .timeframe("1D")
                .openTime(now.minus(1, ChronoUnit.DAYS))
                .openPrice(new BigDecimal("184.50000000"))
                .highPrice(new BigDecimal("188.00000000"))
                .lowPrice(new BigDecimal("183.00000000"))
                .closePrice(new BigDecimal("187.10000000"))
                .volume(new BigDecimal("1800000.00000000"))
                .build();

        candleRepository.saveAll(List.of(candleDay2, candleDay1));

        List<MarketCandle> result = candleRepository.findByAssetCodeAndTimeframeOrderByOpenTimeAsc("AAPL", "1D");

        assertThat(result).hasSize(2);
        // Doit être trié chronologiquement pour Lightweight Charts
        assertThat(result.get(0).getOpenTime()).isEqualTo(candleDay1.getOpenTime());
        assertThat(result.get(1).getOpenTime()).isEqualTo(candleDay2.getOpenTime());
        assertThat(result.get(0).getClosePrice()).isEqualByComparingTo("184.20");
    }

    @Test
    @DisplayName("Doit lever une exception d'intégrité en cas d'insertion d'un doublon (assetCode, timeframe, openTime)")
    void save_duplicateCandle_throwsDataIntegrityViolationException() {
        MarketCandle candle1 = MarketCandle.builder()
                .assetCode("NVDA")
                .timeframe("1D")
                .openTime(now)
                .openPrice(new BigDecimal("120.00000000"))
                .highPrice(new BigDecimal("125.00000000"))
                .lowPrice(new BigDecimal("119.00000000"))
                .closePrice(new BigDecimal("124.50000000"))
                .volume(new BigDecimal("500000.00000000"))
                .build();

        candleRepository.saveAndFlush(candle1);

        MarketCandle duplicateCandle = MarketCandle.builder()
                .assetCode("NVDA")
                .timeframe("1D")
                .openTime(now) // Même clé composite
                .openPrice(new BigDecimal("122.00000000"))
                .highPrice(new BigDecimal("126.00000000"))
                .lowPrice(new BigDecimal("121.00000000"))
                .closePrice(new BigDecimal("125.00000000"))
                .volume(new BigDecimal("600000.00000000"))
                .build();

        assertThatThrownBy(() -> candleRepository.saveAndFlush(duplicateCandle))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Doit vérifier l'existence de données pour un actif et un timeframe")
    void existsByAssetCodeAndTimeframe_returnsTrueWhenDataPresent() {
        MarketCandle candle = MarketCandle.builder()
                .assetCode("MSFT")
                .timeframe("1D")
                .openTime(now)
                .openPrice(new BigDecimal("420.00000000"))
                .highPrice(new BigDecimal("425.00000000"))
                .lowPrice(new BigDecimal("418.00000000"))
                .closePrice(new BigDecimal("422.00000000"))
                .volume(new BigDecimal("900000.00000000"))
                .build();

        candleRepository.saveAndFlush(candle);

        assertThat(candleRepository.existsByAssetCodeAndTimeframe("MSFT", "1D")).isTrue();
        assertThat(candleRepository.existsByAssetCodeAndTimeframe("MSFT", "1h")).isFalse();
        assertThat(candleRepository.existsByAssetCodeAndTimeframe("TSLA", "1D")).isFalse();
    }

    @Test
    @DisplayName("Doit récupérer les N dernières bougies triées par date descendante")
    void findLatestCandles_returnsRequestedPageSize() {
        for (int i = 5; i >= 1; i--) {
            candleRepository.save(MarketCandle.builder()
                    .assetCode("BTC")
                    .timeframe("1D")
                    .openTime(now.minus(i, ChronoUnit.DAYS))
                    .openPrice(new BigDecimal("60000.00000000"))
                    .highPrice(new BigDecimal("61000.00000000"))
                    .lowPrice(new BigDecimal("59000.00000000"))
                    .closePrice(new BigDecimal("60500.00000000"))
                    .volume(new BigDecimal("100.00000000"))
                    .build());
        }
        candleRepository.flush();

        List<MarketCandle> latest2 = candleRepository.findLatestCandles("BTC", "1D", PageRequest.of(0, 2));

        assertThat(latest2).hasSize(2);
        // Le plus récent d'abord
        assertThat(latest2.get(0).getOpenTime()).isEqualTo(now.minus(1, ChronoUnit.DAYS));
        assertThat(latest2.get(1).getOpenTime()).isEqualTo(now.minus(2, ChronoUnit.DAYS));
    }
}
